import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { BookingStatus, BookingType, NotificationType } from "@prisma/client";
import type { Request } from "express";
import { auditLog } from "../../../common/utils/audit-log";
import { allocateCode } from "../../../common/utils/allocate-sequence-code";
import { wallClock } from "../../../common/utils/day-bounds";
import { APP_TIMEZONE } from "../../../common/utils/format-time";
import { roundAmount } from "../../../common/utils/money";
import { isAirportTrip } from "../../../common/utils/places";
import { requireUserId, toRequestContext } from "../../../common/utils/to-request-context";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { SequenceService } from "../../../infrastructure/sequence/sequence.service";
import { NotificationService } from "../../notification/services/notification.service";
import { PlatformSettingsService } from "../../platform-settings/services/platform-settings.service";
import type { BookingPricing } from "../../platform-settings/types/platform-settings";
import { bookingPricing } from "../../platform-settings/utils/pricing";
import { PublicService as VehiclePricingService } from "../../vehicle-categories/services/public.service";
import type {
  AnalyticsQueryDto,
  CalendarQueryDto,
  CancelDto,
  CreateDto,
  QueryDto,
  UpdateDto,
} from "../dto/booking.dto";
import { BookingRepository } from "../repositories/booking.repository";
import type {
  AddressInput,
  Analytics,
  CalendarEvent,
  PassengerInput,
  TimeInput,
  UpdateData,
} from "../types/booking";

@Injectable()
export class BookingService {
  constructor(
    @Inject(BookingRepository) private readonly bookingRepository: BookingRepository,
    @Inject(SequenceService) private readonly sequenceService: SequenceService,
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(NotificationService) private readonly notificationService: NotificationService,
    @Inject(PlatformSettingsService)
    private readonly platformSettingsService: PlatformSettingsService,
    @Inject(VehiclePricingService)
    private readonly vehiclePricingService: VehiclePricingService,
  ) {}

  /**
   * Prices a customer booking on the server from the distance pricing and platform settings,
   * so the total never comes from the client. Hourly quotes keep the entered pricing.
   */
  private async priceCustomerBooking(
    body: CreateDto,
  ): Promise<CreateDto["pricing"] | BookingPricing> {
    const bookingType = body.bookingType ?? BookingType.ONE_WAY;
    if (bookingType !== BookingType.ONE_WAY && bookingType !== BookingType.RETURN) {
      return body.pricing;
    }

    const rates = await this.platformSettingsService.get();
    const pickupAt = wallClock(
      APP_TIMEZONE,
      body.bookingTime.pickupDate,
      body.bookingTime.pickupTime,
    );
    if (!pickupAt) {
      throw new BadRequestException("Pickup date or time is invalid");
    }
    if (pickupAt.getTime() < Date.now() + rates.minBookingMinutes * 60_000) {
      throw new BadRequestException(
        `Bookings need at least ${rates.minBookingNotice} ${rates.minBookingNoticeUnit === "HOUR" ? "hour(s)" : "minute(s)"} notice`,
      );
    }

    const basePrice = await this.vehiclePricingService.basePriceFor(
      body.vehicleCategoryId,
      body.address.distance,
    );
    if (basePrice === null) {
      throw new BadRequestException("This vehicle is not available for the trip distance");
    }

    const items = await this.bookingRepository.priceItems(
      body.extraServices ?? [],
      body.luggage ?? [],
    );
    const lineTotal = (
      total: number,
      item: { unitPrice: { toNumber(): number }; quantity: number },
    ) => total + item.unitPrice.toNumber() * item.quantity;
    const extraServicesPrice =
      items.extraServices.reduce(lineTotal, 0) + items.luggage.reduce(lineTotal, 0);

    const isReturn = bookingType === BookingType.RETURN;
    return bookingPricing({
      basePrice,
      rates,
      isAirport: isAirportTrip(body.address.pickup.address, body.address.dropoff?.address),
      isReturn,
      vehicleCount: body.vehicleCount ?? 1,
      stopsCount: (body.address.stops ?? []).length,
      meetAndGreetLegs:
        Number(Boolean(body.meetAndGreet?.enabled)) +
        Number(isReturn && Boolean(body.meetAndGreet?.returnEnabled)),
      extraServicesPrice: roundAmount(extraServicesPrice),
    });
  }

  async create(body: CreateDto, request: Request) {
    const context = toRequestContext(request);
    const userId = requireUserId(context);
    const pricing = await this.priceCustomerBooking(body);
    const bookingNumber = await allocateCode({
      prefix: "BK",
      nextSequence: () => this.sequenceService.nextBooking(),
    });
    const created = await this.prisma.$transaction(async (tx) => {
      const booking = await this.bookingRepository.create(
        {
          userId,
          vehicleCategoryId: body.vehicleCategoryId,
          bookingNumber,
          bookingType: body.bookingType ?? BookingType.ONE_WAY,
          vehicleCount: body.vehicleCount,
          status: BookingStatus.PENDING,
          pricing,
          address: body.address,
          passenger: body.passenger,
          bookingTime: body.bookingTime,
          flightDetails: body.flightDetails,
          meetAndGreet: body.meetAndGreet,
          extraServices: body.extraServices,
          notes: body.notes ?? null,
          luggage: body.luggage ?? [],
        },
        tx,
      );

      const notifications = await this.notificationService.stageForAdmins(
        {
          type: NotificationType.BOOKING_CREATED,
          title: "New booking",
          body: `Booking ${booking.bookingNumber} was created.`,
          data: {
            type: "BOOKING_CREATED",
            bookingId: booking.id,
            bookingNumber: booking.bookingNumber,
          },
          excludeUserId: userId,
          idempotencyKey: `BOOKING_CREATED:${booking.id}`,
        },
        tx,
      );

      return { booking, notifications };
    });
    const booking = created.booking;
    await this.notificationService.deliverStaged(created.notifications);

    await auditLog({
      prisma: this.prisma,
      event: "booking.created",
      result: "success",
      context,
      userId,
      metadata: {
        bookingId: booking.id,
        bookingNumber: booking.bookingNumber,
        status: booking.status,
      },
    });

    return (await this.bookingRepository.findOwnedByUser(booking.id, userId)) ?? booking;
  }

  async createManual(body: CreateDto, request: Request) {
    const context = toRequestContext(request);
    const confirmedAt = new Date();
    const bookingNumber = await allocateCode({
      prefix: "BK",
      nextSequence: () => this.sequenceService.nextBooking(),
    });

    const booking = await this.bookingRepository.create({
      userId: null,
      vehicleCategoryId: body.vehicleCategoryId,
      bookingNumber,
      bookingType: body.bookingType ?? BookingType.ONE_WAY,
      vehicleCount: body.vehicleCount,
      status: BookingStatus.CONFIRMED,
      confirmedAt,
      pricing: body.pricing,
      address: body.address,
      passenger: body.passenger,
      bookingTime: body.bookingTime,
      flightDetails: body.flightDetails,
      meetAndGreet: body.meetAndGreet,
      extraServices: body.extraServices,
      notes: body.notes ?? null,
      luggage: body.luggage ?? [],
    });

    await auditLog({
      prisma: this.prisma,
      event: "booking.created",
      result: "success",
      context,
      userId: context.userId,
      metadata: {
        bookingId: booking.id,
        bookingNumber: booking.bookingNumber,
        status: booking.status,
        source: "admin",
      },
    });

    return (await this.bookingRepository.findById(booking.id)) ?? booking;
  }

  /** Platform-wide booking calendar for admins. */
  calendar(query: CalendarQueryDto) {
    return this.buildCalendar(query);
  }

  /** The signed-in customer's own bookings on the calendar. */
  calendarForCustomer(query: CalendarQueryDto, request: Request) {
    return this.buildCalendar(query, requireUserId(toRequestContext(request)));
  }

  /** Bookings in the range as calendar events; pending, confirmed and completed by default. */
  async buildCalendar(query: CalendarQueryDto, userId?: string): Promise<CalendarEvent[]> {
    const days = (Date.parse(query.end) - Date.parse(query.start)) / 86_400_000;
    if (!Number.isFinite(days) || days < 0 || days > 62) {
      throw new BadRequestException("Choose a date range of up to 62 days");
    }

    const rows = await this.bookingRepository.findForCalendar({
      start: query.start,
      end: query.end,
      bookingTypes: query.bookingType,
      statuses: query.status?.length
        ? query.status
        : [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.COMPLETED],
      userId,
    });

    return rows.map((row) => {
      const address = row.address as AddressInput;
      const passenger = row.passenger as PassengerInput;
      const time = row.bookingTime as TimeInput;
      return {
        id: row.id,
        bookingNumber: row.bookingNumber,
        bookingType: row.bookingType,
        status: row.status,
        pickupDate: time.pickupDate,
        pickupTime: time.pickupTime,
        returnDate: time.returnDate ?? null,
        returnTime: time.returnTime ?? null,
        customerName: passenger.name,
        vehicleName: row.vehicleCategory.name,
        pickupAddress: address.pickup.address,
        dropoffAddress: address.dropoff?.address ?? null,
      };
    });
  }

  list(query: QueryDto) {
    return this.bookingRepository.findMany(query);
  }

  /** Platform-wide booking analytics for admins. */
  /** Platform-wide, or one customer's when `userId` is given (admin). */
  analytics(query: AnalyticsQueryDto) {
    return this.buildAnalytics(query.year ?? new Date().getUTCFullYear(), query.userId);
  }

  /** The signed-in customer's own booking analytics. */
  analyticsForCustomer(query: AnalyticsQueryDto, request: Request) {
    const userId = requireUserId(toRequestContext(request));
    return this.buildAnalytics(query.year ?? new Date().getUTCFullYear(), userId);
  }

  async buildAnalytics(year: number, userId?: string): Promise<Analytics> {
    const rows = await this.bookingRepository.analyticsRows(year, userId);
    const months = () => Array<number>(12).fill(0);
    const result: Analytics = {
      year,
      totalBookings: 0,
      totalRevenue: 0,
      completedBookings: 0,
      confirmedBookings: 0,
      pendingBookings: 0,
      cancelledBookings: 0,
      monthlyRevenue: months(),
      monthlyBookings: {
        completed: months(),
        confirmed: months(),
        pending: months(),
        cancelled: months(),
      },
    };

    for (const row of rows) {
      const index = row.month - 1;
      result.totalBookings += row.count;

      if (row.status === BookingStatus.COMPLETED) {
        result.completedBookings += row.count;
        result.monthlyBookings.completed[index] =
          (result.monthlyBookings.completed[index] ?? 0) + row.count;
        result.totalRevenue += row.amount;
        result.monthlyRevenue[index] = (result.monthlyRevenue[index] ?? 0) + row.amount;
      } else if (row.status === BookingStatus.CONFIRMED) {
        result.confirmedBookings += row.count;
        result.monthlyBookings.confirmed[index] =
          (result.monthlyBookings.confirmed[index] ?? 0) + row.count;
      } else if (row.status === BookingStatus.PENDING) {
        result.pendingBookings += row.count;
        result.monthlyBookings.pending[index] =
          (result.monthlyBookings.pending[index] ?? 0) + row.count;
      } else if (row.status === BookingStatus.CANCELLED) {
        result.cancelledBookings += row.count;
        result.monthlyBookings.cancelled[index] =
          (result.monthlyBookings.cancelled[index] ?? 0) + row.count;
      }
    }

    result.totalRevenue = Math.round(result.totalRevenue * 100) / 100;
    result.monthlyRevenue = result.monthlyRevenue.map((value) => Math.round(value * 100) / 100);
    return result;
  }

  listForCustomer(query: QueryDto, request: Request) {
    const userId = requireUserId(toRequestContext(request));
    return this.bookingRepository.findMany(query, userId);
  }

  async getForCustomer(id: string, request: Request) {
    const userId = requireUserId(toRequestContext(request));
    const booking = await this.bookingRepository.findOwnedByUser(id, userId);
    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    return booking;
  }

  async cancelForCustomer(id: string, body: CancelDto, request: Request) {
    await this.getForCustomer(id, request);
    return this.cancel(id, body, request);
  }

  async getOne(id: string) {
    const booking = await this.bookingRepository.findById(id);
    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    return booking;
  }

  async update(id: string, body: UpdateDto, request: Request) {
    const context = toRequestContext(request);

    const booking = await this.bookingRepository.findById(id);
    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    if (booking.status !== BookingStatus.DRAFT) {
      throw new BadRequestException("Only draft bookings can be updated");
    }

    const updateData: UpdateData = {};

    if (body.vehicleCategoryId !== undefined) {
      updateData.vehicleCategoryId = body.vehicleCategoryId;
    }
    if (body.bookingType !== undefined) {
      updateData.bookingType = body.bookingType;
    }
    if (body.pricing !== undefined) {
      updateData.pricing = body.pricing;
    }
    if (body.address !== undefined) {
      updateData.address = body.address;
    }
    if (body.passenger !== undefined) {
      updateData.passenger = body.passenger;
    }
    if (body.bookingTime !== undefined) {
      updateData.bookingTime = body.bookingTime;
    }
    if (body.flightDetails !== undefined) {
      updateData.flightDetails = body.flightDetails;
    }
    if (body.meetAndGreet !== undefined) {
      updateData.meetAndGreet = body.meetAndGreet;
    }
    if (body.extraServices !== undefined) {
      updateData.extraServices = body.extraServices;
    }
    if (body.notes !== undefined) {
      updateData.notes = body.notes;
    }
    if (body.luggage !== undefined) {
      updateData.luggage = body.luggage;
    }

    const updated = await this.bookingRepository.update(id, updateData);

    await auditLog({
      prisma: this.prisma,
      event: "booking.updated",
      result: "success",
      context,
      userId: context.userId,
      metadata: { bookingId: updated.id, bookingNumber: updated.bookingNumber },
    });

    return updated;
  }

  async confirm(id: string, request: Request) {
    const context = toRequestContext(request);

    const booking = await this.bookingRepository.findById(id);
    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    if (booking.status !== BookingStatus.CONFIRMED) {
      if (booking.status !== BookingStatus.DRAFT && booking.status !== BookingStatus.PENDING) {
        throw new BadRequestException(
          `Cannot transition booking from ${booking.status} to ${BookingStatus.CONFIRMED}`,
        );
      }
    }

    const updated = await this.bookingRepository.updateStatus(id, BookingStatus.CONFIRMED, {
      confirmedAt: new Date(),
    });

    await auditLog({
      prisma: this.prisma,
      event: "booking.confirmed",
      result: "success",
      context,
      userId: context.userId,
      metadata: { bookingId: updated.id, bookingNumber: updated.bookingNumber },
    });

    return updated;
  }

  async complete(id: string, request: Request) {
    const context = toRequestContext(request);

    const booking = await this.bookingRepository.findById(id);
    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException("Only confirmed bookings can be completed");
    }

    const updated = await this.bookingRepository.updateStatus(id, BookingStatus.COMPLETED, {
      completedAt: new Date(),
    });

    await auditLog({
      prisma: this.prisma,
      event: "booking.completed",
      result: "success",
      context,
      userId: context.userId,
      metadata: { bookingId: updated.id, bookingNumber: updated.bookingNumber },
    });

    return updated;
  }

  async cancel(id: string, body: CancelDto, request: Request) {
    const context = toRequestContext(request);

    const booking = await this.bookingRepository.findById(id);
    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    if (
      booking.status !== BookingStatus.DRAFT &&
      booking.status !== BookingStatus.PENDING &&
      booking.status !== BookingStatus.CONFIRMED
    ) {
      throw new BadRequestException("This booking cannot be cancelled");
    }

    const cancelExtra: { cancelledAt: Date; cancellationReason?: string } = {
      cancelledAt: new Date(),
    };
    if (body.cancellationReason !== undefined) {
      cancelExtra.cancellationReason = body.cancellationReason.trim();
    }

    const updated = await this.bookingRepository.updateStatus(
      id,
      BookingStatus.CANCELLED,
      cancelExtra,
    );

    await auditLog({
      prisma: this.prisma,
      event: "booking.cancelled",
      result: "success",
      context,
      userId: context.userId,
      metadata: {
        bookingId: updated.id,
        bookingNumber: updated.bookingNumber,
        reason: updated.cancellationReason,
      },
    });

    return updated;
  }

  async remove(id: string, request: Request) {
    const context = toRequestContext(request);

    const booking = await this.bookingRepository.findById(id);
    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    if (
      booking.status !== BookingStatus.DRAFT &&
      booking.status !== BookingStatus.CANCELLED &&
      booking.status !== BookingStatus.PENDING
    ) {
      throw new BadRequestException("Only draft, pending, or cancelled bookings can be deleted");
    }

    const deleted = await this.bookingRepository.delete(id);

    await auditLog({
      prisma: this.prisma,
      event: "booking.deleted",
      result: "success",
      context,
      userId: context.userId,
      metadata: { bookingId: deleted.id, bookingNumber: deleted.bookingNumber },
    });

    return deleted;
  }

  async bulkRemove(ids: string[], request: Request) {
    const context = toRequestContext(request);

    const result = await this.bookingRepository.bulkRemove(ids);

    await auditLog({
      prisma: this.prisma,
      event: "booking.bulk_deleted",
      result: "success",
      context,
      userId: context.userId,
      metadata: { count: result.count, ids },
    });

    return { success: true, count: result.count };
  }
}
