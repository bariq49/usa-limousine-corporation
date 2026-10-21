import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { BookingStatus, BookingType, NotificationType } from "@prisma/client";
import type { Request } from "express";
import { auditLog } from "../../../common/utils/audit-log";
import { allocateCode } from "../../../common/utils/allocate-sequence-code";
import { requireUserId, toRequestContext } from "../../../common/utils/to-request-context";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { SequenceService } from "../../../infrastructure/sequence/sequence.service";
import { NotificationService } from "../../notification/services/notification.service";
import type {
  AnalyticsQueryDto,
  CancelDto,
  CreateDto,
  QueryDto,
  UpdateDto,
} from "../dto/booking.dto";
import { BookingRepository } from "../repositories/booking.repository";
import type { Analytics, UpdateData } from "../types/booking";

@Injectable()
export class BookingService {
  constructor(
    @Inject(BookingRepository) private readonly bookingRepository: BookingRepository,
    @Inject(SequenceService) private readonly sequenceService: SequenceService,
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(NotificationService) private readonly notificationService: NotificationService,
  ) {}

  async create(body: CreateDto, request: Request) {
    const context = toRequestContext(request);
    const userId = requireUserId(context);
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
          status: BookingStatus.PENDING,
          pricing: body.pricing,
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

  list(query: QueryDto) {
    return this.bookingRepository.findMany(query);
  }

  /** Platform-wide booking analytics for admins. */
  analytics(query: AnalyticsQueryDto) {
    return this.buildAnalytics(query.year ?? new Date().getUTCFullYear());
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
