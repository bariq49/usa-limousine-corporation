import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import {
  Audience,
  BookingStatus,
  BookingType,
  CalendarEventType,
  CalendarOwnerType,
  ConversationSubjectType,
  DriverPresenceStatus,
  NotificationType,
  Prisma,
  TripStatus,
} from "@prisma/client";
import type { Request } from "express";
import { auditLog } from "../../../common/utils/audit-log";
import { requireUserId, toRequestContext } from "../../../common/utils/to-request-context";
import { requireDriver } from "../../driver/utils/require-driver";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { wallClock } from "../../../common/utils/day-bounds";
import { formatDate } from "../../../common/utils/format-date";
import { APP_TIMEZONE, formatTime } from "../../../common/utils/format-time";
import { NotifyService } from "../../booking/services/notify.service";
import { OfferService } from "../../booking/services/offer.service";
import { hasOverlap, slots } from "../utils/overlap";
import { DriverRepository } from "../../driver/repositories/driver.repository";
import { DriverRequestEventService } from "../../driver/services/request-event.service";
import { DriverWalletService } from "../../driver/services/wallet.service";
import { DriverRealtimeService } from "../../driver/websocket/driver-realtime.service";
import { NotificationService } from "../../notification/services/notification.service";
import { RecipientType } from "../../notification/types/notification";
import { RefundService } from "../../payment/services/refund.service";
import { SubscriptionService } from "../../subscription/services/subscription.service";
import { CalendarService } from "../../calendar/services/calendar.service";
import { SettingsRepository } from "../../settings/repositories/settings.repository";
import { WalletService } from "../../wallet/services/wallet.service";
import type { CancelDto, CreateDto, ListQueryDto, QueryDto, ReviewDto } from "../dto/trip.dto";
import { ACTIVE_TRIP_STATUSES, BUFFER_MIN, IN_PROGRESS } from "../constants/trip.constants";
import { TripRepository } from "../repositories/trip.repository";
import type { CustomerTracking } from "../types/tracking";
import type { BookingTimeData, UpdateStatusData } from "../types/trip";
import { ChatService } from "../../chat/services/chat.service";
import { etaMinutesTo } from "../utils/eta";
import { LocationService } from "./location.service";

@Injectable()
export class TripService {
  private readonly logger = new Logger(TripService.name);

  constructor(
    @Inject(TripRepository) private readonly tripRepository: TripRepository,
    @Inject(DriverRepository) private readonly driverRepository: DriverRepository,
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(NotificationService) private readonly notificationService: NotificationService,
    @Inject(DriverRealtimeService) private readonly driverRealtime: DriverRealtimeService,
    @Inject(WalletService) private readonly walletService: WalletService,
    @Inject(DriverWalletService) private readonly driverWalletService: DriverWalletService,
    @Inject(NotifyService) private readonly notify: NotifyService,
    @Inject(LocationService) private readonly locationService: LocationService,
    @Inject(SubscriptionService) private readonly subscriptions: SubscriptionService,
    @Inject(CalendarService) private readonly calendar: CalendarService,
    @Inject(SettingsRepository) private readonly settings: SettingsRepository,
    @Inject(RefundService) private readonly refunds: RefundService,
    @Inject(OfferService) private readonly offers: OfferService,
    @Inject(ChatService) private readonly chat: ChatService,
    @Inject(DriverRequestEventService) private readonly requestEvents: DriverRequestEventService,
  ) {}

  async create(body: CreateDto, request: Request) {
    const context = toRequestContext(request);
    const driver = await requireDriver(this.driverRepository, request);

    if (driver.presenceStatus !== DriverPresenceStatus.ONLINE) {
      throw new BadRequestException("Go online to accept available bookings");
    }

    if (!driver.vehicle) {
      throw new BadRequestException("Driver vehicle is required before accepting a trip");
    }

    await this.subscriptions.assertCanAcceptTrip(Audience.DRIVER, driver.id);

    const booking = await this.tripRepository.findBooking(body.bookingId);

    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException("Only confirmed bookings can be accepted as trips");
    }

    if (booking.trip) {
      throw new ConflictException("A trip already exists for this booking");
    }

    if (booking.vehicleCategoryId !== driver.vehicle.vehicleCategoryId) {
      throw new BadRequestException(
        "Driver vehicle category does not match the booking vehicle category",
      );
    }

    const bookingTime = booking.bookingTime as BookingTimeData | null;

    const settings = await this.prisma.driverSettings.findUnique({
      where: { driverId: driver.id },
      select: { timezone: true },
    });
    const timezone = settings?.timezone || APP_TIMEZONE;
    const duration = (booking.address as { duration?: number } | null)?.duration ?? 0;
    const vehicleId = driver.vehicle.id;

    let trip;
    try {
      trip = await this.prisma.$transaction(async (tx) => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`trip-accept:${driver.id}`}))`;

        const nextSlots = slots({
          bookingTime,
          duration,
          timezone,
          bufferMin: BUFFER_MIN,
        });
        if (nextSlots.length > 0) {
          const open = await this.tripRepository.listOpenByDriver(driver.id, tx);
          for (const row of open) {
            const current = slots({
              bookingTime: row.booking.bookingTime as BookingTimeData | null,
              duration: (row.booking.address as { duration?: number } | null)?.duration ?? 0,
              timezone,
              bufferMin: BUFFER_MIN,
            });
            if (hasOverlap({ left: nextSlots, right: current })) {
              throw new ConflictException("You already have a booking at this time");
            }
          }
        }

        return this.tripRepository.create(
          {
            bookingId: body.bookingId,
            driverId: driver.id,
            vehicleId,
          },
          tx,
        );
      });
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictException("A trip already exists for this booking");
      }
      throw error;
    }

    await auditLog({
      prisma: this.prisma,
      event: "trip.created",
      result: "success",
      context,
      userId: context.userId,
      metadata: {
        tripId: trip.id,
        bookingId: trip.bookingId,
        driverId: trip.driverId,
      },
    });

    await this.requestEvents.attachTrip({
      bookingId: trip.bookingId,
      driverId: trip.driverId,
      tripId: trip.id,
    });

    await this.notify.taken({
      bookingId: trip.bookingId,
      tripId: trip.id,
      excludeDriverId: trip.driverId,
    });

    await this.locationService.onStart({
      tripId: trip.id,
      driverId: trip.driverId,
      customerUserId: booking.userId ?? null,
    });

    const durationMs = duration * 60 * 1000;
    const pickupDate = bookingTime?.pickupDate;
    const pickupTime = bookingTime?.pickupTime ?? "00:00";

    if (pickupDate) {
      const pickupStart = wallClock(timezone, pickupDate, pickupTime);
      if (!pickupStart) {
        return trip;
      }

      const title = `Booking #${booking.bookingNumber}`;
      const createEvent = (bookingType: BookingType, eventTitle: string, startAt: Date) =>
        this.calendar.create({
          ownerType: CalendarOwnerType.DRIVER,
          ownerId: driver.id,
          bookingId: booking.id,
          bookingType,
          type: CalendarEventType.BOOKING,
          title: eventTitle,
          startAt,
          endAt: new Date(startAt.getTime() + durationMs),
        });

      if (booking.bookingType === BookingType.RETURN) {
        await createEvent(BookingType.ONE_WAY, title, pickupStart);
        const returnDate = bookingTime?.returnDate;
        const returnTime = bookingTime?.returnTime;
        if (returnDate && returnTime) {
          const returnStart = wallClock(timezone, returnDate, returnTime);
          if (returnStart) {
            await createEvent(BookingType.RETURN, `${title} (Return)`, returnStart);
          }
        }
      } else if (booking.bookingType === BookingType.HOURLY) {
        await createEvent(BookingType.HOURLY, `${title} (Hourly)`, pickupStart);
      } else if (booking.bookingType === BookingType.CREW_RIDE) {
        await createEvent(BookingType.CREW_RIDE, `${title} (Crew Ride)`, pickupStart);
      } else {
        await createEvent(BookingType.ONE_WAY, title, pickupStart);
      }
    }

    return trip;
  }

  async list(query: QueryDto, request: Request) {
    const driver = await requireDriver(this.driverRepository, request);
    return this.tripRepository.findMany({
      query,
      driverId: driver.id,
    });
  }

  async listActive(query: ListQueryDto, request: Request) {
    const driver = await requireDriver(this.driverRepository, request);
    const settings = await this.prisma.driverSettings.findUnique({
      where: { driverId: driver.id },
      select: { timezone: true },
    });
    const today = formatDate(new Date(), settings?.timezone || APP_TIMEZONE);
    return this.tripRepository.findMany({
      query,
      driverId: driver.id,
      statuses: ACTIVE_TRIP_STATUSES,
      pickupDate: { lte: today },
    });
  }

  async listUpcoming(query: ListQueryDto, request: Request) {
    const driver = await requireDriver(this.driverRepository, request);
    const settings = await this.prisma.driverSettings.findUnique({
      where: { driverId: driver.id },
      select: { timezone: true },
    });
    const timezone = settings?.timezone || APP_TIMEZONE;
    return this.tripRepository.findMany({
      query,
      driverId: driver.id,
      statuses: [TripStatus.ACCEPTED],
      pickupDate: {
        gt: formatDate(new Date(), timezone),
      },
    });
  }

  async listCompleted(query: ListQueryDto, request: Request) {
    const driver = await requireDriver(this.driverRepository, request);
    return this.tripRepository.findMany({
      query,
      driverId: driver.id,
      statuses: [TripStatus.COMPLETED],
    });
  }

  async listCancelled(query: ListQueryDto, request: Request) {
    const driver = await requireDriver(this.driverRepository, request);
    return this.tripRepository.findMany({
      query,
      driverId: driver.id,
      statuses: [TripStatus.CANCELLED],
    });
  }

  async listForCustomer(query: QueryDto, request: Request) {
    const userId = requireUserId(toRequestContext(request));
    return this.tripRepository.findMany({
      query,
      userId,
    });
  }

  async listActiveForCustomer(query: ListQueryDto, request: Request) {
    const userId = requireUserId(toRequestContext(request));
    const settings = await this.prisma.customerSettings.findFirst({
      where: { customer: { userId, deletedAt: null } },
      select: { timezone: true },
    });
    const today = formatDate(new Date(), settings?.timezone || APP_TIMEZONE);
    return this.tripRepository.findMany({
      query,
      userId,
      statuses: ACTIVE_TRIP_STATUSES,
      pickupDate: { lte: today },
    });
  }

  async listUpcomingForCustomer(query: ListQueryDto, request: Request) {
    const userId = requireUserId(toRequestContext(request));
    const settings = await this.prisma.customerSettings.findFirst({
      where: { customer: { userId, deletedAt: null } },
      select: { timezone: true },
    });
    const timezone = settings?.timezone || APP_TIMEZONE;
    return this.tripRepository.findMany({
      query,
      userId,
      statuses: [TripStatus.ACCEPTED],
      pickupDate: {
        gt: formatDate(new Date(), timezone),
      },
    });
  }

  async listCompletedForCustomer(query: ListQueryDto, request: Request) {
    const userId = requireUserId(toRequestContext(request));
    return this.tripRepository.findMany({
      query,
      userId,
      statuses: [TripStatus.COMPLETED],
    });
  }

  async listCancelledForCustomer(query: ListQueryDto, request: Request) {
    const userId = requireUserId(toRequestContext(request));
    return this.tripRepository.findMany({
      query,
      userId,
      statuses: [TripStatus.CANCELLED],
    });
  }

  async getOne(id: string, request: Request) {
    const driver = await requireDriver(this.driverRepository, request);
    const trip = await this.tripRepository.findByIdForDriver(id, driver.id);
    if (!trip) {
      throw new NotFoundException("Trip not found");
    }
    return trip;
  }

  async start(id: string, request: Request) {
    const context = toRequestContext(request);
    const driver = await requireDriver(this.driverRepository, request);
    const trip = await this.tripRepository.findByIdForDriver(id, driver.id);
    if (!trip) {
      throw new NotFoundException("Trip not found");
    }

    if (trip.status !== TripStatus.ACCEPTED) {
      throw new BadRequestException(`Cannot start trip from ${trip.status}`);
    }

    const bookingTime = trip.booking?.bookingTime as BookingTimeData | null;
    const pickupDate = bookingTime?.pickupDate;
    const pickupTime = bookingTime?.pickupTime;
    if (pickupDate && pickupTime) {
      const settings = await this.prisma.driverSettings.findUnique({
        where: { driverId: driver.id },
        select: { timezone: true },
      });
      const timezone = settings?.timezone || APP_TIMEZONE;
      const now = new Date();
      const today = formatDate(now, timezone);
      const time = formatTime(now, timezone);
      if (pickupDate > today || (pickupDate === today && pickupTime > time)) {
        throw new BadRequestException("Cannot start trip before the booking time");
      }
    }

    const inProgress = await this.tripRepository.findActiveForDriver({
      driverId: driver.id,
      excludeId: trip.id,
      statuses: IN_PROGRESS,
    });
    if (inProgress) {
      throw new ConflictException("You already have a started trip");
    }

    const updateData: UpdateStatusData = {
      status: TripStatus.STARTED,
      actorUserId: requireUserId(context),
      startedAt: new Date(),
    };
    const updated = await this.tripRepository.updateStatus(id, updateData);

    await auditLog({
      prisma: this.prisma,
      event: "trip.status_updated",
      result: "success",
      context,
      userId: context.userId,
      metadata: {
        tripId: updated.id,
        bookingId: updated.bookingId,
        previousStatus: trip.status,
        newStatus: updated.status,
      },
    });

    const booking = await this.tripRepository.findBooking(updated.bookingId);
    try {
      await this.chat.openForTrip({
        tripId: updated.id,
        driverUserId: driver.userId,
        customerUserId: booking?.userId ?? null,
      });
    } catch (error) {
      this.logger.error(
        `Failed to open chat for trip ${updated.id}`,
        error instanceof Error ? error.stack : String(error),
      );
    }

    return updated;
  }

  async arrivedAtPickup(id: string, request: Request) {
    const context = toRequestContext(request);
    const driver = await requireDriver(this.driverRepository, request);
    const trip = await this.tripRepository.findByIdForDriver(id, driver.id);
    if (!trip) {
      throw new NotFoundException("Trip not found");
    }

    if (trip.status !== TripStatus.STARTED) {
      throw new BadRequestException(`Cannot set arrived-at-pickup from ${trip.status}`);
    }

    const updateData: UpdateStatusData = {
      status: TripStatus.ARRIVED_AT_PICKUP,
      actorUserId: requireUserId(context),
      arrivedAtPickupAt: new Date(),
    };
    const updated = await this.tripRepository.updateStatus(id, updateData);

    await auditLog({
      prisma: this.prisma,
      event: "trip.status_updated",
      result: "success",
      context,
      userId: context.userId,
      metadata: {
        tripId: updated.id,
        bookingId: updated.bookingId,
        previousStatus: trip.status,
        newStatus: updated.status,
      },
    });

    return updated;
  }

  async passengerOnBoard(id: string, request: Request) {
    const context = toRequestContext(request);
    const driver = await requireDriver(this.driverRepository, request);
    const trip = await this.tripRepository.findByIdForDriver(id, driver.id);
    if (!trip) {
      throw new NotFoundException("Trip not found");
    }

    if (trip.status !== TripStatus.ARRIVED_AT_PICKUP) {
      throw new BadRequestException(`Cannot set passenger-on-board from ${trip.status}`);
    }

    const updateData: UpdateStatusData = {
      status: TripStatus.PASSENGER_ON_BOARD,
      actorUserId: requireUserId(context),
      pickedUpAt: new Date(),
    };
    const updated = await this.tripRepository.updateStatus(id, updateData);

    await auditLog({
      prisma: this.prisma,
      event: "trip.status_updated",
      result: "success",
      context,
      userId: context.userId,
      metadata: {
        tripId: updated.id,
        bookingId: updated.bookingId,
        previousStatus: trip.status,
        newStatus: updated.status,
      },
    });

    return updated;
  }

  async enRouteToDropoff(id: string, request: Request) {
    const context = toRequestContext(request);
    const driver = await requireDriver(this.driverRepository, request);
    const trip = await this.tripRepository.findByIdForDriver(id, driver.id);
    if (!trip) {
      throw new NotFoundException("Trip not found");
    }

    if (trip.status !== TripStatus.PASSENGER_ON_BOARD) {
      throw new BadRequestException(`Cannot set en-route-to-dropoff from ${trip.status}`);
    }

    const updateData: UpdateStatusData = {
      status: TripStatus.EN_ROUTE_TO_DROPOFF,
      actorUserId: requireUserId(context),
    };
    const updated = await this.tripRepository.updateStatus(id, updateData);

    await auditLog({
      prisma: this.prisma,
      event: "trip.status_updated",
      result: "success",
      context,
      userId: context.userId,
      metadata: {
        tripId: updated.id,
        bookingId: updated.bookingId,
        previousStatus: trip.status,
        newStatus: updated.status,
      },
    });

    return updated;
  }

  async arrivedAtDropoff(id: string, request: Request) {
    const context = toRequestContext(request);
    const driver = await requireDriver(this.driverRepository, request);
    const trip = await this.tripRepository.findByIdForDriver(id, driver.id);
    if (!trip) {
      throw new NotFoundException("Trip not found");
    }

    if (trip.status !== TripStatus.EN_ROUTE_TO_DROPOFF) {
      throw new BadRequestException(`Cannot set arrived-at-dropoff from ${trip.status}`);
    }

    const updateData: UpdateStatusData = {
      status: TripStatus.ARRIVED_AT_DROPOFF,
      actorUserId: requireUserId(context),
      droppedOffAt: new Date(),
    };
    const updated = await this.tripRepository.updateStatus(id, updateData);

    await auditLog({
      prisma: this.prisma,
      event: "trip.status_updated",
      result: "success",
      context,
      userId: context.userId,
      metadata: {
        tripId: updated.id,
        bookingId: updated.bookingId,
        previousStatus: trip.status,
        newStatus: updated.status,
      },
    });

    return updated;
  }

  async complete(id: string, request: Request) {
    const context = toRequestContext(request);
    const driver = await requireDriver(this.driverRepository, request);
    const trip = await this.tripRepository.findByIdForDriver(id, driver.id);
    if (!trip) {
      throw new NotFoundException("Trip not found");
    }

    if (trip.status !== TripStatus.ARRIVED_AT_DROPOFF) {
      throw new BadRequestException(`Cannot complete trip from ${trip.status}`);
    }

    const updateData: UpdateStatusData = {
      status: TripStatus.COMPLETED,
      actorUserId: requireUserId(context),
      completedAt: new Date(),
    };
    const updated = await this.tripRepository.updateStatus(id, updateData);

    await this.subscriptions.recordTripUse(Audience.DRIVER, driver.id);
    await this.prisma.driver.update({
      where: { id: driver.id },
      data: { completedTrips: { increment: 1 } },
    });

    await auditLog({
      prisma: this.prisma,
      event: "trip.status_updated",
      result: "success",
      context,
      userId: context.userId,
      metadata: {
        tripId: updated.id,
        bookingId: updated.bookingId,
        previousStatus: trip.status,
        newStatus: updated.status,
      },
    });

    const booking = await this.tripRepository.findBooking(updated.bookingId);
    const bookingNumber = booking?.bookingNumber ?? updated.bookingId;
    const pricing = booking?.pricing as { total?: unknown } | null;
    const amount = typeof pricing?.total === "number" ? pricing.total : NaN;

    if (Number.isFinite(amount) && amount > 0) {
      const walletId = await this.driverWalletService.ensureWalletId(driver.id);
      const result = await this.walletService.credit({
        walletId,
        tripId: updated.id,
        bookingId: updated.bookingId,
        amount,
        description: `Trip completed for booking ${bookingNumber}`,
      });

      const creditedAmount = result.amount ?? amount;
      const balance = result.balance ?? 0;
      const transactionId = result.transactionId ?? "";

      if (result.credited) {
        const payload = {
          tripId: updated.id,
          bookingId: updated.bookingId,
          bookingNumber,
          amount: creditedAmount,
          balance,
          transactionId,
        };

        this.driverRealtime.emitWalletCredited(driver.id, payload);

        await this.notificationService.notify({
          recipientType: RecipientType.DRIVER,
          recipientId: driver.id,
          type: NotificationType.WALLET_CREDITED,
          title: "Wallet credited",
          body: `Booking ${bookingNumber} completed. ${creditedAmount} added to your wallet.`,
          data: {
            type: "WALLET_CREDITED",
            payload,
          },
          push: true,
        });
      }

      await auditLog({
        prisma: this.prisma,
        event: result.credited ? "wallet.credited" : "wallet.credit_idempotent",
        result: "success",
        context,
        userId: context.userId,
        metadata: {
          tripId: updated.id,
          bookingId: updated.bookingId,
          transactionId,
          amount: creditedAmount,
          balance,
          credited: result.credited,
        },
      });
    } else {
      await auditLog({
        prisma: this.prisma,
        event: "wallet.credit_skipped",
        result: "failure",
        context,
        userId: context.userId,
        metadata: {
          tripId: updated.id,
          bookingId: updated.bookingId,
          reason: "invalid_booking_pricing_total",
        },
      });
    }

    if (booking?.userId) {
      await this.notificationService.notify({
        recipientType: RecipientType.USER,
        recipientId: booking.userId,
        type: NotificationType.TRIP_COMPLETED,
        title: "Trip completed",
        body: `Your trip ${bookingNumber} is complete. Please rate your driver.`,
        data: {
          type: "TRIP_COMPLETED",
          payload: {
            tripId: updated.id,
            bookingId: updated.bookingId,
            bookingNumber,
            driverId: updated.driverId,
          },
        },
        push: true,
      });
    }

    await this.locationService.onEnd({
      tripId: updated.id,
      driverId: updated.driverId,
      customerUserId: booking?.userId ?? null,
    });

    await this.requestEvents.markFinished({
      bookingId: updated.bookingId,
      driverId: updated.driverId,
      tripId: updated.id,
    });

    try {
      await this.chat.closeForSubject({
        subjectType: ConversationSubjectType.TRIP,
        subjectId: updated.id,
      });
    } catch (error) {
      this.logger.error(
        `Failed to close chat for completed trip ${updated.id}`,
        error instanceof Error ? error.stack : String(error),
      );
    }

    return updated;
  }

  async cancel(id: string, body: CancelDto, request: Request) {
    const context = toRequestContext(request);
    const driver = await requireDriver(this.driverRepository, request);
    const trip = await this.tripRepository.findByIdForDriver(id, driver.id);
    if (!trip) {
      throw new NotFoundException("Trip not found");
    }

    if (!ACTIVE_TRIP_STATUSES.includes(trip.status)) {
      throw new BadRequestException(`Cannot cancel trip from ${trip.status}`);
    }

    const policy = await this.settings.getCancelPolicy();
    const refundPercent =
      trip.status === TripStatus.ACCEPTED
        ? policy.driverCancelRefundPercent
        : Math.min(policy.driverCancelRefundPercent, policy.cancelRefundAfterStartPercent);

    return this.finalizeCancel({
      trip,
      previousStatus: trip.status,
      actorUserId: requireUserId(context),
      context,
      reason: body.cancellationReason?.trim() || "Cancelled by driver",
      refundPercent,
      reseek: policy.driverCancelReseek,
      notifyCustomer: true,
      notifyDriverId: driver.id,
      activityOutcome: "driver_cancelled",
    });
  }

  async cancelByCustomer(id: string, body: CancelDto, request: Request) {
    const context = toRequestContext(request);
    const userId = requireUserId(context);
    const trip = await this.tripRepository.findByIdForCustomer(id, userId);
    if (!trip) {
      throw new NotFoundException("Trip not found");
    }
    if (!ACTIVE_TRIP_STATUSES.includes(trip.status)) {
      throw new BadRequestException(`Cannot cancel trip from ${trip.status}`);
    }

    const policy = await this.settings.getCancelPolicy();
    const refundPercent =
      trip.status === TripStatus.ACCEPTED
        ? policy.cancelRefundBeforeStartPercent
        : policy.cancelRefundAfterStartPercent;

    return this.finalizeCancel({
      trip,
      previousStatus: trip.status,
      actorUserId: userId,
      context,
      reason: body.cancellationReason?.trim() || "Cancelled by customer",
      refundPercent,
      reseek: false,
      notifyCustomer: true,
      notifyDriverId: trip.driverId,
      activityOutcome: "client_cancelled",
    });
  }

  async noShow(id: string, request: Request) {
    const context = toRequestContext(request);
    const driver = await requireDriver(this.driverRepository, request);
    const trip = await this.tripRepository.findByIdForDriver(id, driver.id);
    if (!trip) {
      throw new NotFoundException("Trip not found");
    }
    if (trip.status !== TripStatus.ARRIVED_AT_PICKUP) {
      throw new BadRequestException("No-show is only allowed after arrived-at-pickup");
    }
    if (!trip.arrivedAtPickupAt) {
      throw new BadRequestException("Missing arrived-at-pickup timestamp");
    }

    const policy = await this.settings.getCancelPolicy();
    const waitedMs = Date.now() - trip.arrivedAtPickupAt.getTime();
    const requiredMs = policy.pickupFreeWaitMin * 60_000;
    if (waitedMs < requiredMs) {
      const remainSec = Math.ceil((requiredMs - waitedMs) / 1000);
      throw new BadRequestException(
        `Free wait not finished — ${remainSec}s remaining before no-show`,
      );
    }

    return this.finalizeCancel({
      trip,
      previousStatus: trip.status,
      actorUserId: requireUserId(context),
      context,
      reason: "Passenger no-show",
      refundPercent: policy.noShowRefundPercent,
      reseek: false,
      notifyCustomer: true,
      notifyDriverId: driver.id,
      activityOutcome: "client_no_show",
    });
  }

  private async finalizeCancel(params: {
    trip: { id: string; bookingId: string; driverId: string; status: TripStatus };
    previousStatus: TripStatus;
    actorUserId: string;
    context: ReturnType<typeof toRequestContext>;
    reason: string;
    refundPercent: number;
    reseek: boolean;
    notifyCustomer: boolean;
    notifyDriverId: string;
    activityOutcome: "driver_cancelled" | "client_cancelled" | "client_no_show";
  }) {
    const updateData: UpdateStatusData = {
      status: TripStatus.CANCELLED,
      actorUserId: params.actorUserId,
      cancelledAt: new Date(),
      cancellationReason: params.reason,
    };

    const updated = await this.tripRepository.updateStatus(params.trip.id, updateData);

    let refund: { refundedNow: number; percent: number } | null = null;
    try {
      const result = await this.refunds.refundBookingPercent(
        params.trip.bookingId,
        params.refundPercent,
      );
      refund = { refundedNow: result.refundedNow, percent: result.percent };
    } catch {
      refund = { refundedNow: 0, percent: params.refundPercent };
    }

    if (params.reseek) {
      await this.offers.startSeeking(params.trip.bookingId);
    } else {
      await this.prisma.booking.update({
        where: { id: params.trip.bookingId },
        data: {
          status: BookingStatus.CANCELLED,
          cancellationReason: params.reason,
        },
      });
    }

    await auditLog({
      prisma: this.prisma,
      event: "trip.status_updated",
      result: "success",
      context: params.context,
      userId: params.actorUserId,
      metadata: {
        tripId: updated.id,
        bookingId: updated.bookingId,
        previousStatus: params.previousStatus,
        newStatus: updated.status,
        refund,
        reseek: params.reseek,
      },
    });

    const booking = await this.tripRepository.findBooking(updated.bookingId);
    const bookingNumber = booking?.bookingNumber ?? updated.bookingId;

    await this.notificationService.notify({
      recipientType: RecipientType.DRIVER,
      recipientId: params.notifyDriverId,
      type: NotificationType.TRIP_CANCELLED,
      title: "Trip cancelled",
      body: `Trip ${bookingNumber} was cancelled.`,
      data: {
        type: "TRIP_CANCELLED",
        payload: {
          tripId: updated.id,
          bookingId: updated.bookingId,
          bookingNumber,
          cancellationReason: updated.cancellationReason ?? null,
          refund,
        },
      },
      push: true,
    });

    if (params.notifyCustomer && booking?.userId) {
      await this.notificationService.notify({
        recipientType: RecipientType.USER,
        recipientId: booking.userId,
        type: NotificationType.TRIP_CANCELLED,
        title: "Trip cancelled",
        body: `Your trip ${bookingNumber} was cancelled.`,
        data: {
          type: "TRIP_CANCELLED",
          payload: {
            tripId: updated.id,
            bookingId: updated.bookingId,
            bookingNumber,
            cancellationReason: updated.cancellationReason ?? null,
            refund,
          },
        },
        push: true,
      });
    }

    await this.locationService.onEnd({
      tripId: updated.id,
      driverId: updated.driverId,
      customerUserId: booking?.userId ?? null,
    });

    const activityParams = {
      bookingId: updated.bookingId,
      driverId: updated.driverId,
      tripId: updated.id,
    };
    if (params.activityOutcome === "driver_cancelled") {
      await this.requestEvents.markDriverCancelled(activityParams);
    } else if (params.activityOutcome === "client_cancelled") {
      await this.requestEvents.markClientTripCancelled(activityParams);
    } else {
      await this.requestEvents.markClientNoShow(activityParams);
    }

    try {
      await this.chat.closeForSubject({
        subjectType: ConversationSubjectType.TRIP,
        subjectId: updated.id,
      });
    } catch (error) {
      this.logger.error(
        `Failed to close chat for cancelled trip ${updated.id}`,
        error instanceof Error ? error.stack : String(error),
      );
    }

    return { ...updated, refund, reseek: params.reseek };
  }

  async getChatForDriver(tripId: string, request: Request) {
    const driver = await requireDriver(this.driverRepository, request);
    const trip = await this.tripRepository.findByIdForDriver(tripId, driver.id);
    if (!trip) {
      throw new NotFoundException("Trip not found");
    }
    return this.chat.resolveTripConversation({
      tripId,
      userId: driver.userId,
    });
  }

  async getLocationForCustomer(tripId: string, request: Request): Promise<CustomerTracking> {
    const userId = requireUserId(toRequestContext(request));
    const trip = await this.tripRepository.findTrackingForCustomer(tripId, userId);
    if (!trip) {
      throw new NotFoundException("Trip not found");
    }
    if (!ACTIVE_TRIP_STATUSES.includes(trip.status)) {
      throw new BadRequestException("Live tracking is only available during an active trip");
    }

    const latest = await this.locationService.latestForTrip({
      tripId: trip.id,
      driverId: trip.driverId,
    });

    const address = trip.booking.address as {
      pickup?: { latitude?: number; longitude?: number };
      dropoff?: { latitude?: number; longitude?: number };
    };

    let etaMinutes: number | null = null;
    if (latest.lat != null && latest.lng != null) {
      const toPickup =
        trip.status === TripStatus.ACCEPTED ||
        trip.status === TripStatus.STARTED ||
        trip.status === TripStatus.ARRIVED_AT_PICKUP;
      const target = toPickup ? address.pickup : address.dropoff;
      if (typeof target?.latitude === "number" && typeof target?.longitude === "number") {
        etaMinutes = etaMinutesTo(
          { lat: latest.lat, lng: latest.lng },
          { lat: target.latitude, lng: target.longitude },
        );
      }
    }

    const vehicle = trip.vehicle
      ? {
          id: trip.vehicle.id,
          label: `${trip.vehicle.make} ${trip.vehicle.model} ${trip.vehicle.year}`.trim(),
          make: trip.vehicle.make,
          model: trip.vehicle.model,
          color: trip.vehicle.color,
          plate: trip.vehicle.licensePlate,
          category: trip.vehicle.vehicleCategory?.name ?? null,
        }
      : null;

    return {
      id: trip.id,
      bookingId: trip.bookingId,
      status: trip.status,
      watchToken: null,
      etaMinutes,
      startedAt: trip.startedAt?.toISOString() ?? null,
      completedAt: trip.completedAt?.toISOString() ?? null,
      cancelledAt: trip.cancelledAt?.toISOString() ?? null,
      driver: {
        id: trip.driver.id,
        firstName: trip.driver.firstName,
        lastName: trip.driver.lastName,
        email: trip.driver.email,
        phone: trip.driver.phone,
        rating: Number(trip.driver.ratingAvg.toFixed(1)),
        rideCount: trip.driver.completedTrips,
        avatarUrl: trip.driver.avatarUrl,
      },
      vehicle,
      driverLocation: {
        latitude: latest.lat,
        longitude: latest.lng,
        heading: latest.heading,
        speed: latest.speed,
        accuracy: latest.accuracy,
        lastSeenAt: latest.timestamp ? new Date(latest.timestamp).toISOString() : null,
        stale: latest.stale,
      },
      booking: {
        id: trip.booking.id,
        bookingNumber: trip.booking.bookingNumber,
        bookingType: trip.booking.bookingType,
        status: trip.booking.status,
        pricing: trip.booking.pricing,
        address: trip.booking.address,
        passenger: trip.booking.passenger,
        bookingTime: trip.booking.bookingTime,
        vehicleCategory: trip.booking.vehicleCategory
          ? { id: trip.booking.vehicleCategory.id, name: trip.booking.vehicleCategory.name }
          : null,
      },
    };
  }

  async getChatForCustomer(tripId: string, request: Request) {
    const userId = requireUserId(toRequestContext(request));
    const trip = await this.tripRepository.findByIdForCustomer(tripId, userId);
    if (!trip) {
      throw new NotFoundException("Trip not found");
    }
    return this.chat.resolveTripConversation({ tripId, userId });
  }

  async review(id: string, body: ReviewDto, request: Request) {
    const context = toRequestContext(request);
    const driver = await requireDriver(this.driverRepository, request);
    const trip = await this.tripRepository.findByIdForDriver(id, driver.id);
    if (!trip) {
      throw new NotFoundException("Trip not found");
    }

    if (trip.status !== TripStatus.COMPLETED) {
      throw new BadRequestException("Only completed trips can be reviewed");
    }

    const existing = await this.tripRepository.findReviewByTripId(trip.id, driver.id);
    if (existing) {
      throw new ConflictException("Trip already reviewed");
    }

    const booking = await this.tripRepository.findBooking(trip.bookingId);
    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    const review = await this.tripRepository.createReview({
      tripId: trip.id,
      driverId: driver.id,
      bookingId: booking.id,
      rating: body.rating,
      comment: body.comment,
      passenger: (booking.passenger as Prisma.InputJsonValue | null) ?? null,
    });

    await auditLog({
      prisma: this.prisma,
      event: "trip.passenger_reviewed",
      result: "success",
      context,
      userId: context.userId,
      metadata: {
        tripId: trip.id,
        bookingId: booking.id,
        rating: body.rating,
      },
    });

    return review;
  }

  async reviewDriver(id: string, body: ReviewDto, request: Request) {
    const context = toRequestContext(request);
    const userId = requireUserId(context);

    const customer = await this.prisma.customer.findFirst({
      where: { userId, deletedAt: null },
      select: { id: true },
    });
    if (!customer) {
      throw new NotFoundException("Customer profile not found");
    }

    const trip = await this.tripRepository.findByIdForCustomer(id, userId);
    if (!trip) {
      throw new NotFoundException("Trip not found");
    }
    if (trip.status !== TripStatus.COMPLETED) {
      throw new BadRequestException("Only completed trips can be reviewed");
    }

    const existing = await this.tripRepository.findDriverReviewByTripId(trip.id);
    if (existing) {
      throw new ConflictException("Driver already reviewed for this trip");
    }

    const review = await this.tripRepository.createDriverReview({
      tripId: trip.id,
      driverId: trip.driverId,
      bookingId: trip.bookingId,
      customerId: customer.id,
      rating: body.rating,
      comment: body.comment,
    });

    await this.tripRepository.applyDriverRating({
      driverId: trip.driverId,
      rating: body.rating,
    });

    await auditLog({
      prisma: this.prisma,
      event: "trip.driver_reviewed",
      result: "success",
      context,
      userId,
      metadata: {
        tripId: trip.id,
        bookingId: trip.bookingId,
        driverId: trip.driverId,
        customerId: customer.id,
        rating: body.rating,
      },
    });

    return review;
  }
}
