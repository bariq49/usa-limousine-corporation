import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { BookingStatus, BookingType, NotificationType, PaymentStatus } from "@prisma/client";
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
import type { BookingPricing, PricedLine } from "../../platform-settings/types/platform-settings";
import { bookingPricing } from "../../platform-settings/utils/pricing";
import { PublicService as VehiclePricingService } from "../../vehicle-categories/services/public.service";
import type {
  AnalyticsQueryDto,
  CalendarQueryDto,
  CancelDto,
  CheckoutDto,
  CreateDto,
  QueryDto,
  TripPriceDto,
  UpdateDto,
} from "../dto/booking.dto";
import { BookingRepository } from "../repositories/booking.repository";
import { BookingEmailService } from "./booking-email.service";
import { BookingSmsService } from "./booking-sms.service";
import { SquareService } from "../../../infrastructure/square/square.service";
import type {
  AddressInput,
  Analytics,
  CalendarEvent,
  PassengerInput,
  TimeInput,
  TripPricing,
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
    @Inject(BookingEmailService) private readonly bookingEmails: BookingEmailService,
    @Inject(BookingSmsService) private readonly bookingSms: BookingSmsService,
    @Inject(SquareService) private readonly square: SquareService,
  ) {}

  async tripPricing(body: TripPriceDto, checkNotice = true): Promise<TripPricing> {
    const bookingType = body.bookingType ?? BookingType.ONE_WAY;
    if (bookingType !== BookingType.ONE_WAY && bookingType !== BookingType.RETURN) {
      throw new BadRequestException("Hourly hire is quoted on request; please contact us");
    }
    if (!body.address.dropoff) {
      throw new BadRequestException("A drop-off location is required");
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
    if (checkNotice && pickupAt.getTime() <= Date.now()) {
      throw new BadRequestException({
        message: "The pickup time has already passed. Please choose a later time.",
        error: "PICKUP_PASSED",
      });
    }
    if (checkNotice && pickupAt.getTime() < Date.now() + rates.minBookingMinutes * 60_000) {
      throw new BadRequestException({
        message: `Bookings need at least ${rates.minBookingNotice} ${rates.minBookingNoticeUnit === "HOUR" ? "hour(s)" : "minute(s)"} notice. Please choose a later time.`,
        error: "PICKUP_TOO_SOON",
      });
    }

    const isReturn = bookingType === BookingType.RETURN;
    if (isReturn) {
      const { returnDate, returnTime } = body.bookingTime;
      const returnAt =
        returnDate && returnTime ? wallClock(APP_TIMEZONE, returnDate, returnTime) : null;
      if (!returnAt) {
        throw new BadRequestException("Return date and time are required for a return trip");
      }
      if (returnAt.getTime() <= pickupAt.getTime()) {
        throw new BadRequestException("The return must be after the pickup");
      }
    }

    const items = await this.bookingRepository.priceItems(
      body.extraServices ?? [],
      body.luggage ?? [],
    );
    const lines: PricedLine[] = items.extraServices
      .map((item): PricedLine => {
        const returnQuantity = isReturn ? item.returnQuantity : 0;
        const unitPrice = item.unitPrice.toNumber();
        return {
          type: "EXTRA_SERVICE",
          id: item.extraServiceId,
          name: item.name,
          quantity: item.quantity,
          returnQuantity,
          unitPrice,
          total: roundAmount(unitPrice * (item.quantity + returnQuantity)),
        };
      })
      .concat(
        items.luggage.map((item): PricedLine => {
          const unitPrice = item.unitPrice.toNumber();
          return {
            type: "LUGGAGE",
            id: item.luggageTypeId,
            name: item.name,
            quantity: item.quantity,
            returnQuantity: 0,
            unitPrice,
            total: roundAmount(unitPrice * item.quantity),
          };
        }),
      )
      .filter((line) => line.total > 0);
    const extraServicesPrice = lines.reduce((total, line) => total + line.total, 0);

    return {
      rates,
      isAirport: isAirportTrip(body.address.pickup.address, body.address.dropoff.address),
      isReturn,
      stopsCount: (body.address.stops ?? []).length,
      meetAndGreetOneWay: Boolean(body.meetAndGreet?.enabled),
      meetAndGreetReturn: isReturn && Boolean(body.meetAndGreet?.returnEnabled),
      extraServicesPrice: roundAmount(extraServicesPrice),
      notificationsPrice: roundAmount(
        (body.notifications?.email ? rates.emailNotificationFee : 0) +
          (body.notifications?.sms ? rates.smsNotificationFee : 0),
      ),
      items: lines,
    };
  }

  async priceForCustomer(body: CreateDto | CheckoutDto): Promise<BookingPricing> {
    const vehicleCount = body.vehicleCount ?? 1;
    const capacity = await this.bookingRepository.vehicleCapacity(body.vehicleCategoryId);
    if (!capacity) {
      throw new BadRequestException("This vehicle is not available");
    }
    if (body.passenger.passengerCount > capacity.passengers * vehicleCount) {
      throw new BadRequestException(
        `Up to ${capacity.passengers * vehicleCount} passengers fit in the selected vehicles`,
      );
    }
    const luggageCount = (body.luggage ?? []).reduce((total, item) => total + item.quantity, 0);
    if (luggageCount > capacity.luggage * vehicleCount) {
      throw new BadRequestException(
        `Up to ${capacity.luggage * vehicleCount} bags fit in the selected vehicles`,
      );
    }

    const trip = await this.tripPricing(body);
    const basePrice = await this.vehiclePricingService.basePriceFor(
      body.vehicleCategoryId,
      body.address.distance,
    );
    if (basePrice === null) {
      throw new BadRequestException("This vehicle is not available for the trip distance");
    }

    return bookingPricing(Object.assign({ basePrice, vehicleCount }, trip));
  }

  async create(body: CreateDto, request: Request) {
    const context = toRequestContext(request);
    const userId = requireUserId(context);
    const pricing = await this.priceForCustomer(body);
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
          returnNotes: body.returnNotes ?? null,
          notifyByEmail: body.notifications?.email,
          notifyBySms: body.notifications?.sms,
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
    void this.bookingEmails.sendCreated(booking.id);

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
      returnNotes: body.returnNotes ?? null,
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
    void this.bookingEmails.sendConfirmed(booking.id);
    void this.bookingSms.sendConfirmed(booking.id);

    return (await this.bookingRepository.findById(booking.id)) ?? booking;
  }

  calendar(query: CalendarQueryDto) {
    return this.buildCalendar(query);
  }

  calendarForCustomer(query: CalendarQueryDto, request: Request) {
    return this.buildCalendar(query, requireUserId(toRequestContext(request)));
  }

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

  analytics(query: AnalyticsQueryDto) {
    return this.buildAnalytics(query.year ?? new Date().getUTCFullYear(), query.userId);
  }

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
    const booking = await this.getForCustomer(id, request);
    if (booking.status !== BookingStatus.PENDING && booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException("This booking cannot be cancelled");
    }

    const rates = await this.platformSettingsService.get();
    const time = booking.bookingTime as TimeInput;
    const pickupAt = wallClock(APP_TIMEZONE, time.pickupDate, time.pickupTime);
    if (pickupAt && pickupAt.getTime() - Date.now() < rates.cancellationMinutes * 60_000) {
      const unit = rates.cancellationNoticeUnit === "HOUR" ? "hour" : "minute";
      const plural = rates.cancellationNotice === 1 ? "" : "s";
      throw new BadRequestException(
        `Bookings can only be cancelled up to ${rates.cancellationNotice} ${unit}${plural} before pickup. Please contact us.`,
      );
    }

    let refundAmount = 0;
    const payment = await this.bookingRepository.findPaymentForRefund(id);
    if (payment?.status === PaymentStatus.PAID && payment.squarePaymentId) {
      refundAmount = roundAmount((payment.amount.toNumber() * rates.cancellationRefundRate) / 100);
      if (refundAmount > 0) {
        const refundId = await this.square.refundPayment(
          payment.mode,
          payment.squarePaymentId,
          refundAmount,
          `Booking ${booking.bookingNumber} cancelled by the customer`,
        );
        await this.bookingRepository.recordRefund(payment.id, refundAmount, refundId);
      }
    }

    return this.cancel(id, body, request, { refundAmount, byCustomer: true });
  }

  async completeForCustomer(id: string, request: Request) {
    const booking = await this.getForCustomer(id, request);
    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException("Only confirmed bookings can be completed");
    }

    const time = booking.bookingTime as TimeInput;
    const pickupAt = wallClock(APP_TIMEZONE, time.pickupDate, time.pickupTime);
    if (pickupAt && pickupAt.getTime() > Date.now()) {
      throw new BadRequestException("You can mark the ride completed after the pickup time");
    }

    return this.complete(id, request);
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
    if (body.returnNotes !== undefined) {
      updateData.returnNotes = body.returnNotes;
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
    if (booking.status !== BookingStatus.CONFIRMED) {
      void this.bookingEmails.sendConfirmed(updated.id);
      void this.bookingSms.sendConfirmed(updated.id);
    }

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
    void this.bookingEmails.sendCompleted(updated.id);
    void this.bookingSms.sendCompleted(updated.id);

    return updated;
  }

  async cancel(
    id: string,
    body: CancelDto,
    request: Request,
    options: { refundAmount: number; byCustomer: boolean } = { refundAmount: 0, byCustomer: false },
  ) {
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
    void this.bookingEmails.sendCancelled(updated.id, updated.cancellationReason, options);
    void this.bookingSms.sendCancelled(
      updated.id,
      updated.cancellationReason,
      options.refundAmount,
    );
    if (options.byCustomer) {
      await this.notifyAdminsCancelled(updated, context.userId);
    }

    return updated;
  }

  private async notifyAdminsCancelled(
    booking: { id: string; bookingNumber: string },
    userId: string | null | undefined,
  ) {
    const notifications = await this.prisma.$transaction((tx) =>
      this.notificationService.stageForAdmins(
        {
          type: NotificationType.BOOKING_CANCELLED,
          title: "Booking cancelled",
          body: `Booking ${booking.bookingNumber} was cancelled by the customer.`,
          data: {
            type: "BOOKING_CANCELLED",
            bookingId: booking.id,
            bookingNumber: booking.bookingNumber,
          },
          excludeUserId: userId ?? null,
          idempotencyKey: `BOOKING_CANCELLED:${booking.id}`,
        },
        tx,
      ),
    );
    await this.notificationService.deliverStaged(notifications);
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
