import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { BookingStatus, BookingType } from "@prisma/client";
import type { Request } from "express";
import { auditLog } from "../../../common/utils/audit-log";
import { allocateCode } from "../../../common/utils/allocate-sequence-code";
import { wallClock } from "../../../common/utils/day-bounds";
import { APP_TIMEZONE } from "../../../common/utils/format-time";
import { requireUserId, toRequestContext } from "../../../common/utils/to-request-context";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { SequenceService } from "../../../infrastructure/sequence/sequence.service";
import { PlatformSettingsService } from "../../platform-settings/services/platform-settings.service";
import type {
  AnalyticsQueryDto,
  CalendarQueryDto,
  CancelDto,
  CreateDto,
  QueryDto,
} from "../dto/booking.dto";
import { BookingRepository } from "../repositories/booking.repository";
import type { Analytics, CalendarEvent, TimeInput } from "../types/booking";
import { BookingEmailService } from "./email.service";
import { NotificationService } from "./notification.service";
import { BookingPricingService } from "./pricing.service";
import { BookingService } from "./booking.service";

@Injectable()
export class CustomerBookingService {
  constructor(
    @Inject(BookingRepository) private readonly bookingRepository: BookingRepository,
    @Inject(SequenceService) private readonly sequenceService: SequenceService,
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(NotificationService) private readonly notifications: NotificationService,
    @Inject(PlatformSettingsService)
    private readonly platformSettingsService: PlatformSettingsService,
    @Inject(BookingPricingService) private readonly pricingService: BookingPricingService,
    @Inject(BookingService) private readonly bookingService: BookingService,
    @Inject(BookingEmailService) private readonly bookingEmails: BookingEmailService,
  ) {}

  async create(body: CreateDto, request: Request) {
    const context = toRequestContext(request);
    const userId = requireUserId(context);
    const pricing = await this.pricingService.calculatePrice(body);
    const bookingNumber = await allocateCode({
      prefix: "BK",
      nextSequence: () => this.sequenceService.nextBooking(),
    });
    const result = await this.prisma.$transaction(async (tx) => {
      const created = await this.bookingRepository.create(
        {
          userId,
          vehicleCategoryId: body.vehicleCategoryId,
          bookingNumber,
          bookingType: body.bookingType ?? BookingType.ONE_WAY,
          vehicleCount: body.vehicleCount,
          status: BookingStatus.PENDING,
          pricing,
          address: {
            pickup: body.address.pickup,
            dropoff: body.address.dropoff,
            stops: body.address.stops,
            distance: body.address.distance ?? 0,
            travelDuration: body.address.travelDuration ?? 0,
            hourlyDuration: body.address.hourlyDuration,
          },
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

      const stagedNotifications = await this.notifications.stageCreated(
        {
          bookingId: created.id,
          bookingNumber: created.bookingNumber,
          userId,
        },
        tx,
      );

      return { booking: created, notifications: stagedNotifications };
    });

    await this.notifications.deliverStaged(result.notifications);
    void this.bookingEmails.sendCreated(result.booking.id);

    await auditLog({
      prisma: this.prisma,
      event: "booking.created",
      result: "success",
      context,
      userId,
      metadata: {
        bookingId: result.booking.id,
        bookingNumber: result.booking.bookingNumber,
        status: result.booking.status,
      },
    });

    return (
      (await this.bookingRepository.findOwnedByUser(result.booking.id, userId)) ?? result.booking
    );
  }

  list(query: QueryDto, request: Request) {
    const userId = requireUserId(toRequestContext(request));
    return this.bookingRepository.findMany(query, userId);
  }

  async getOne(id: string, request: Request) {
    const userId = requireUserId(toRequestContext(request));
    const booking = await this.bookingRepository.findOwnedByUser(id, userId);
    if (!booking) {
      throw new NotFoundException("Booking not found");
    }
    return booking;
  }

  calendar(query: CalendarQueryDto, request: Request): Promise<CalendarEvent[]> {
    return this.bookingService.buildCalendar(query, requireUserId(toRequestContext(request)));
  }

  analytics(query: AnalyticsQueryDto, request: Request): Promise<Analytics> {
    const userId = requireUserId(toRequestContext(request));
    return this.bookingService.buildAnalytics(
      query.year ?? new Date().getUTCFullYear(),
      userId,
      query.month,
    );
  }

  async cancel(id: string, body: CancelDto, request: Request) {
    const booking = await this.getOne(id, request);
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
        `Bookings must be cancelled at least ${rates.cancellationNotice} ${unit}${plural} before pickup`,
      );
    }

    return this.bookingService.cancel(id, body, request);
  }

  async complete(id: string, request: Request) {
    const booking = await this.getOne(id, request);
    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException("Only confirmed bookings can be completed");
    }

    const time = booking.bookingTime as TimeInput;
    const pickupAt = wallClock(APP_TIMEZONE, time.pickupDate, time.pickupTime);
    if (pickupAt && pickupAt.getTime() > Date.now()) {
      throw new BadRequestException("You can mark the ride completed after the pickup time");
    }

    return this.bookingService.complete(id, request);
  }
}
