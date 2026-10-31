import { Inject, Injectable } from "@nestjs/common";
import { NotificationType, type Notification as NotificationRecord } from "@prisma/client";
import {
  notifyUser,
  notifyForAdmins,
  stageForAdmins,
  stageForUser,
} from "../../../common/utils/notification";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { NotificationService as Notification } from "../../notification/services/notification.service";
import type { Client } from "../../notification/types/notification";
import type { BookingNotifyInput } from "../types/notification";

@Injectable()
export class NotificationService {
  constructor(
    @Inject(Notification) private readonly notification: Notification,
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  async stageCreated(input: BookingNotifyInput, tx: Client): Promise<NotificationRecord[]> {
    const adminNotifications = await stageForAdmins(
      this.notification,
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
      tx,
    );

    const userNotifications = await stageForUser(
      this.notification,
      {
        userId: input.userId,
        type: NotificationType.BOOKING_CREATED,
        title: "Booking received",
        body: `Your booking ${input.bookingNumber} was created.`,
        data: {
          type: "BOOKING_CREATED",
          bookingId: input.bookingId,
          bookingNumber: input.bookingNumber,
        },
        idempotencyKey: `BOOKING_CREATED_CUSTOMER:${input.bookingId}`,
      },
      tx,
    );

    return adminNotifications.concat(userNotifications);
  }

  deliverStaged(notifications: NotificationRecord[]) {
    return this.notification.deliverStaged(notifications);
  }

  async cancelled(input: BookingNotifyInput) {
    if (input.notifyAdmins !== false) {
      const customerLabel = input.customerName?.trim() || "the customer";
      const adminBody = input.reason
        ? `Booking ${input.bookingNumber} was cancelled by ${customerLabel}. Reason: ${input.reason}`
        : `Booking ${input.bookingNumber} was cancelled by ${customerLabel}.`;

      await notifyForAdmins(
        this.notification,
        {
          type: NotificationType.BOOKING_CANCELLED,
          title: "Booking cancelled",
          body: adminBody,
          data: {
            type: "BOOKING_CANCELLED",
            bookingId: input.bookingId,
            bookingNumber: input.bookingNumber,
          },
          excludeUserId: input.excludeUserId ?? null,
          idempotencyKey: `BOOKING_CANCELLED:${input.bookingId}`,
        },
        this.prisma,
      );
    }

    const customerBody = !input.byCustomer
      ? input.reason
        ? `USA Limousine Corporation cancelled your booking ${input.bookingNumber}. Reason: ${input.reason}`
        : `USA Limousine Corporation cancelled your booking ${input.bookingNumber}.`
      : `Your booking ${input.bookingNumber} was cancelled.`;

    await notifyUser(this.notification, {
      userId: input.userId,
      type: NotificationType.BOOKING_CANCELLED,
      title: "Booking cancelled",
      body: customerBody,
      data: {
        type: "BOOKING_CANCELLED",
        bookingId: input.bookingId,
        bookingNumber: input.bookingNumber,
      },
      idempotencyKey: `BOOKING_CANCELLED_CUSTOMER:${input.bookingId}`,
    });
  }

  async paid(input: BookingNotifyInput) {
    await notifyForAdmins(
      this.notification,
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
      this.prisma,
    );

    await notifyUser(this.notification, {
      userId: input.userId,
      type: NotificationType.BOOKING_CREATED,
      title: "Booking confirmed",
      body: `Your booking ${input.bookingNumber} is confirmed and paid.`,
      data: {
        type: "BOOKING_CREATED",
        bookingId: input.bookingId,
        bookingNumber: input.bookingNumber,
      },
      idempotencyKey: `BOOKING_PAID_CUSTOMER:${input.bookingId}`,
    });
  }
}
