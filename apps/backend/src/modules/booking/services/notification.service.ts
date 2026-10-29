import { Inject, Injectable } from "@nestjs/common";
import { NotificationType, type Notification } from "@prisma/client";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { NotificationService as AppNotificationService } from "../../notification/services/notification.service";
import type { Client } from "../../notification/types/notification";
import type { BookingNotifyInput } from "../types/notification";

@Injectable()
export class NotificationService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(AppNotificationService) private readonly appNotifications: AppNotificationService,
  ) {}

  stageCreated(input: BookingNotifyInput, client: Client) {
    return this.appNotifications.stageForAdmins(
      {
        type: NotificationType.BOOKING_CREATED,
        title: "New booking",
        body: `Booking ${input.bookingNumber} was created.`,
        data: {
          type: "BOOKING_CREATED",
          bookingId: input.bookingId,
          bookingNumber: input.bookingNumber,
        },
        excludeUserId: input.excludeUserId ?? null,
        idempotencyKey: `BOOKING_CREATED:${input.bookingId}`,
      },
      client,
    );
  }

  stageCancelled(input: BookingNotifyInput, client: Client) {
    return this.appNotifications.stageForAdmins(
      {
        type: NotificationType.BOOKING_CANCELLED,
        title: "Booking cancelled",
        body: `Booking ${input.bookingNumber} was cancelled by the customer.`,
        data: {
          type: "BOOKING_CANCELLED",
          bookingId: input.bookingId,
          bookingNumber: input.bookingNumber,
        },
        excludeUserId: input.excludeUserId ?? null,
        idempotencyKey: `BOOKING_CANCELLED:${input.bookingId}`,
      },
      client,
    );
  }

  stagePaid(input: BookingNotifyInput, client: Client) {
    return this.appNotifications.stageForAdmins(
      {
        type: NotificationType.BOOKING_CREATED,
        title: "New paid booking",
        body: `Booking ${input.bookingNumber} was paid online.`,
        data: {
          type: "BOOKING_CREATED",
          bookingId: input.bookingId,
          bookingNumber: input.bookingNumber,
        },
        excludeUserId: input.excludeUserId ?? null,
        idempotencyKey: `BOOKING_CREATED:${input.bookingId}`,
      },
      client,
    );
  }

  deliverStaged(notifications: Notification[]) {
    return this.appNotifications.deliverStaged(notifications);
  }

  async created(input: BookingNotifyInput) {
    const staged = await this.prisma.$transaction((tx) => this.stageCreated(input, tx));
    await this.deliverStaged(staged);
  }

  async cancelled(input: BookingNotifyInput) {
    const staged = await this.prisma.$transaction((tx) => this.stageCancelled(input, tx));
    await this.deliverStaged(staged);
  }

  async paid(input: BookingNotifyInput) {
    const staged = await this.prisma.$transaction((tx) => this.stagePaid(input, tx));
    await this.deliverStaged(staged);
  }
}
