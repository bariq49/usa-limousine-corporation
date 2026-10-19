import { Inject, Injectable } from "@nestjs/common";
import { NotificationType } from "@prisma/client";
import { AppLogger } from "../../../common/logger/app.logger";
import { DriverPresenceRepository } from "../../driver/repositories/presence.repository";
import { DriverRequestEventService } from "../../driver/services/request-event.service";
import { NotificationService } from "../../notification/services/notification.service";
import { RecipientType } from "../../notification/types/notification";
import { BookingRepository } from "../repositories/booking.repository";
import type {
  AvailableParams,
  NotifyDrivers,
  OfferAcceptedParams,
  OfferReceivedParams,
  TakenParams,
} from "../types/booking";
import { RealtimeService } from "../websocket/realtime.service";

@Injectable()
export class NotifyService {
  constructor(
    @Inject(NotificationService) private readonly notifications: NotificationService,
    @Inject(DriverPresenceRepository) private readonly presence: DriverPresenceRepository,
    @Inject(BookingRepository) private readonly bookings: BookingRepository,
    @Inject(RealtimeService) private readonly realtime: RealtimeService,
    @Inject(DriverRequestEventService) private readonly requestEvents: DriverRequestEventService,
    @Inject(AppLogger) private readonly logger: AppLogger,
  ) {}

  async available(params: AvailableParams) {
    const { bookingId } = params;

    try {
      const booking = await this.bookings.findById(bookingId);
      if (!booking) {
        return;
      }

      const data = {
        type: "BOOKING_AVAILABLE",
        payload: {
          id: booking.id,
          bookingNumber: booking.bookingNumber,
          pricing: booking.pricing,
          address: booking.address,
          bookingTime: booking.bookingTime,
          passenger: booking.passenger,
          vehicleCategoryId: booking.vehicleCategoryId,
          offerSessionExpiresAt: booking.offerSessionExpiresAt?.toISOString() ?? null,
          matchingRadius: booking.matchingRadius,
          createdAt: booking.createdAt.toISOString(),
        },
      };

      this.realtime.available(booking.vehicleCategoryId, data);
      const driverNotify: NotifyDrivers = {
        type: NotificationType.BOOKING_AVAILABLE,
        title: params.title ?? "New ride request — submit your offer",
        body: params.body ?? `Booking ${booking.bookingNumber} is seeking offers`,
        data,
        vehicleCategoryId: booking.vehicleCategoryId,
        bookingId: booking.id,
      };
      if (params.excludeDriverIds !== undefined) {
        driverNotify.excludeDriverIds = params.excludeDriverIds;
      }
      await this.notifyDrivers(driverNotify);
    } catch (error) {
      this.fail(`Failed to notify drivers that booking ${bookingId} is available`, error);
    }
  }

  async taken(params: TakenParams) {
    const { bookingId, tripId, excludeDriverId } = params;

    try {
      const booking = await this.bookings.findById(bookingId);
      if (!booking) {
        return;
      }

      const data = {
        type: "BOOKING_TAKEN",
        payload: {
          bookingId,
          tripId: tripId ?? null,
          bookingNumber: booking.bookingNumber,
        },
      };

      this.realtime.taken(booking.vehicleCategoryId, data);
      const driverNotify: NotifyDrivers = {
        type: NotificationType.BOOKING_UNAVAILABLE,
        title: params.title ?? "Booking taken",
        body: params.body ?? `Booking ${booking.bookingNumber} was accepted by another driver`,
        data,
        vehicleCategoryId: booking.vehicleCategoryId,
      };
      if (excludeDriverId !== undefined) {
        driverNotify.excludeDriverId = excludeDriverId;
      }
      await this.notifyDrivers(driverNotify);

      const notAccepted: { bookingId: string; excludeDriverId?: string } = {
        bookingId,
      };
      if (excludeDriverId !== undefined) {
        notAccepted.excludeDriverId = excludeDriverId;
      }
      await this.requestEvents.markNotAccepted(notAccepted);
    } catch (error) {
      this.fail(`Failed to notify drivers that booking ${bookingId} was taken`, error);
    }
  }

  async offerReceived(params: OfferReceivedParams) {
    try {
      await this.notifications.notify({
        recipientType: RecipientType.USER,
        recipientId: params.userId,
        type: NotificationType.OFFER_RECEIVED,
        title: "New driver offer",
        body: `A driver offered ${params.quotedPrice.toFixed(2)} for booking ${params.bookingNumber}`,
        data: {
          type: "OFFER_CREATED",
          payload: {
            offerId: params.offerId,
            bookingId: params.bookingId,
            driverId: params.driverId,
            quotedPrice: params.quotedPrice,
            etaMinutes: params.etaMinutes ?? null,
            distance: params.distance ?? null,
          },
        },
        push: true,
        idempotencyKey: `offer-received:${params.offerId}`,
      });
    } catch (error) {
      this.fail(`Failed to notify customer of offer ${params.offerId}`, error);
    }
  }

  async offerAccepted(params: OfferAcceptedParams) {
    try {
      await this.taken({
        bookingId: params.bookingId,
        tripId: null,
        excludeDriverId: params.driverId,
        title: "Booking reserved",
        body: `Booking ${params.bookingNumber} was accepted — awaiting payment`,
      });

      await this.notifications.notify({
        recipientType: RecipientType.DRIVER,
        recipientId: params.driverId,
        type: NotificationType.OFFER_ACCEPTED,
        title: "Offer accepted",
        body: `Customer accepted your offer for ${params.bookingNumber}. Awaiting payment.`,
        data: {
          type: "OFFER_ACCEPTED",
          payload: {
            bookingId: params.bookingId,
            offerId: params.offerId,
            quotedPrice: params.quotedPrice,
            bookingNumber: params.bookingNumber,
          },
        },
        push: true,
        idempotencyKey: `offer-accepted:${params.offerId}`,
      });
    } catch (error) {
      this.fail(`Failed to notify drivers that offer ${params.offerId} was accepted`, error);
    }
  }

  async notifyDrivers(params: NotifyDrivers) {
    const drivers = await this.presence.listOnlineForBooking(params.vehicleCategoryId);
    const excluded = new Set<string>();
    if (params.excludeDriverId) {
      excluded.add(params.excludeDriverId);
    }
    for (const id of params.excludeDriverIds ?? []) {
      excluded.add(id);
    }

    const targets = drivers.filter((driver) => !excluded.has(driver.id));
    if (targets.length === 0) {
      return;
    }

    if (params.bookingId && params.type === NotificationType.BOOKING_AVAILABLE) {
      await this.requestEvents.recordIncoming({
        bookingId: params.bookingId,
        driverIds: targets.map((d) => d.id),
      });
    }

    await this.notifications.notifyMany(
      targets.map((driver) => ({
        recipientType: RecipientType.DRIVER,
        recipientId: driver.id,
        type: params.type,
        title: params.title,
        body: params.body,
        data: params.data,
        push: true,
      })),
    );
  }

  fail(prefix: string, error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    this.logger.error(`${prefix}: ${message}`, NotifyService.name);
  }
}
