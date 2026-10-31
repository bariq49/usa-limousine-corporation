import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { BookingStatus, PaymentStatus, RoleKey } from "@prisma/client";
import type { Request } from "express";
import {
  ANALYTICS_SHORT_RANGES,
  analyticsAnchoredRangeBounds,
  analyticsBucketIndex,
  analyticsCalendarBounds,
  analyticsRangeBounds,
  type AnalyticsBucket,
  type AnalyticsRange,
  type AnalyticsShortRange,
} from "../../../common/utils/analytics-range";
import { auditLog } from "../../../common/utils/audit-log";
import { formatDate } from "../../../common/utils/format-date";
import { roundAmount } from "../../../common/utils/money";
import { toRequestContext } from "../../../common/utils/to-request-context";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import type {
  AnalyticsQueryDto,
  CalendarQueryDto,
  CancelDto,
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
  UpdateStatusData,
} from "../types/booking";
import { PlatformSettingsService } from "../../platform-settings/services/platform-settings.service";
import { BookingEmailService } from "./email.service";
import { NotificationService } from "./notification.service";
import { BookingSmsService } from "./sms.service";

@Injectable()
export class BookingService {
  constructor(
    @Inject(BookingRepository) private readonly bookingRepository: BookingRepository,
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(NotificationService) private readonly notifications: NotificationService,
    @Inject(BookingEmailService) private readonly bookingEmails: BookingEmailService,
    @Inject(BookingSmsService) private readonly bookingSms: BookingSmsService,
    @Inject(PlatformSettingsService)
    private readonly platformSettingsService: PlatformSettingsService,
  ) {}

  list(query: QueryDto) {
    return this.bookingRepository.findMany(query);
  }

  calendar(query: CalendarQueryDto) {
    return this.buildCalendar(query);
  }

  analytics(query: AnalyticsQueryDto) {
    return this.buildAnalytics(query);
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
      updateData.address = {
        pickup: body.address.pickup,
        dropoff: body.address.dropoff,
        stops: body.address.stops,
        distance: body.address.distance ?? 0,
        travelDuration: body.address.travelDuration ?? 0,
        hourlyDuration: body.address.hourlyDuration,
      };
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
        : [BookingStatus.PENDING, BookingStatus.CONFIRMED],
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

  resolveAnalyticsWindow(query: AnalyticsQueryDto): {
    year: number;
    month: number | null;
    range: AnalyticsRange | null;
    start: Date;
    end: Date;
    buckets: AnalyticsBucket[];
    labels: string[];
  } {
    const currentYear = Number(formatDate({ as: "value" }).slice(0, 4));
    const year = query.year ?? currentYear;
    const month = query.month ?? null;
    const shortRange = ANALYTICS_SHORT_RANGES.find((item) => item === query.range);

    if (shortRange) {
      const bounds = analyticsAnchoredRangeBounds(shortRange as AnalyticsShortRange, year, month);
      return {
        year,
        month,
        range: shortRange,
        start: bounds.start,
        end: bounds.end,
        buckets: bounds.buckets,
        labels: bounds.labels,
      };
    }

    if (query.range) {
      const bounds = analyticsRangeBounds(query.range);
      return {
        year,
        month: null,
        range: query.range,
        start: bounds.start,
        end: bounds.end,
        buckets: bounds.buckets,
        labels: bounds.labels,
      };
    }

    const bounds = analyticsCalendarBounds(year, month);
    return {
      year,
      month,
      range: null,
      start: bounds.start,
      end: bounds.end,
      buckets: bounds.buckets,
      labels: bounds.labels,
    };
  }

  async buildAnalytics(query: AnalyticsQueryDto): Promise<Analytics> {
    const window = this.resolveAnalyticsWindow(query);
    const { start, end, buckets, labels, year, month, range } = window;
    const size = buckets.length;
    const series = () => Array<number>(size).fill(0);
    const rows = await this.bookingRepository.analyticsEvents(start, end, query.userId);
    const result: Analytics = {
      year,
      month,
      range,
      labels,
      totalBookings: 0,
      totalRevenue: 0,
      completedAmount: 0,
      confirmedAmount: 0,
      pendingAmount: 0,
      cancelledAmount: 0,
      completedBookings: 0,
      confirmedBookings: 0,
      pendingBookings: 0,
      cancelledBookings: 0,
      monthlyRevenue: series(),
      monthlyBookings: {
        completed: series(),
        confirmed: series(),
        pending: series(),
        cancelled: series(),
      },
      amountSeries: {
        completed: series(),
        confirmed: series(),
        pending: series(),
        cancelled: series(),
      },
    };

    for (const row of rows) {
      const index = analyticsBucketIndex(buckets, new Date(row.createdAt));
      result.totalBookings += 1;

      if (row.status === BookingStatus.COMPLETED) {
        result.completedBookings += 1;
        result.completedAmount += row.amount;
        result.totalRevenue += row.amount;
        if (index >= 0) {
          result.monthlyBookings.completed[index] =
            (result.monthlyBookings.completed[index] ?? 0) + 1;
          result.monthlyRevenue[index] = roundAmount(
            (result.monthlyRevenue[index] ?? 0) + row.amount,
          );
          result.amountSeries.completed[index] = roundAmount(
            (result.amountSeries.completed[index] ?? 0) + row.amount,
          );
        }
      } else if (row.status === BookingStatus.CONFIRMED) {
        result.confirmedBookings += 1;
        result.confirmedAmount += row.amount;
        if (index >= 0) {
          result.monthlyBookings.confirmed[index] =
            (result.monthlyBookings.confirmed[index] ?? 0) + 1;
          result.amountSeries.confirmed[index] = roundAmount(
            (result.amountSeries.confirmed[index] ?? 0) + row.amount,
          );
        }
      } else if (row.status === BookingStatus.PENDING) {
        result.pendingBookings += 1;
        result.pendingAmount += row.amount;
        if (index >= 0) {
          result.monthlyBookings.pending[index] = (result.monthlyBookings.pending[index] ?? 0) + 1;
          result.amountSeries.pending[index] = roundAmount(
            (result.amountSeries.pending[index] ?? 0) + row.amount,
          );
        }
      } else if (row.status === BookingStatus.CANCELLED) {
        result.cancelledBookings += 1;
        result.cancelledAmount += row.amount;
        if (index >= 0) {
          result.monthlyBookings.cancelled[index] =
            (result.monthlyBookings.cancelled[index] ?? 0) + 1;
          result.amountSeries.cancelled[index] = roundAmount(
            (result.amountSeries.cancelled[index] ?? 0) + row.amount,
          );
        }
      }
    }

    result.totalRevenue = roundAmount(result.totalRevenue);
    result.completedAmount = roundAmount(result.completedAmount);
    result.confirmedAmount = roundAmount(result.confirmedAmount);
    result.pendingAmount = roundAmount(result.pendingAmount);
    result.cancelledAmount = roundAmount(result.cancelledAmount);
    return result;
  }

  async cancel(id: string, body: CancelDto, request: Request) {
    const context = toRequestContext(request);

    const booking = await this.bookingRepository.findById(id);
    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    const roles = (request.user as { roles?: string[] } | undefined)?.roles || [];
    const byCustomer = !roles.includes(RoleKey.SUPER_ADMIN);

    const statusData: UpdateStatusData = { cancelledAt: new Date() };
    if (body.cancellationReason !== undefined) {
      statusData.cancellationReason = body.cancellationReason.trim();
    }
    const updated = await this.bookingRepository.updateStatus(
      id,
      BookingStatus.CANCELLED,
      statusData,
    );

    let refundAmount = 0;
    const payment = await this.bookingRepository.findPaymentForRefund(id);
    if (payment && payment.status === PaymentStatus.PAID) {
      const rates = await this.platformSettingsService.get();
      refundAmount = roundAmount((Number(payment.amount) * rates.cancellationRefundRate) / 100);
      if (refundAmount > 0) {
        await this.bookingRepository.createCancellationRefund({
          bookingId: updated.id,
          paymentId: payment.id,
          amount: refundAmount,
          reason: byCustomer
            ? `Customer cancellation (${rates.cancellationRefundRate}% refund rate)`
            : `Admin cancellation (${rates.cancellationRefundRate}% refund rate)`,
        });
      }
    }

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
        refundAmount,
      },
    });

    const passenger = updated.passenger as PassengerInput;
    const customerName = passenger?.name ?? null;

    void this.bookingEmails.sendCancelled({
      bookingId: updated.id,
      reason: updated.cancellationReason,
      byCustomer,
    });
    void this.bookingSms.sendCancelled(updated.id, updated.cancellationReason, byCustomer);

    await this.notifications.cancelled({
      bookingId: updated.id,
      bookingNumber: updated.bookingNumber,
      userId: updated.userId,
      excludeUserId: context.userId ?? null,
      notifyAdmins: byCustomer,
      byCustomer,
      customerName,
      reason: updated.cancellationReason,
    });

    return updated;
  }
}
