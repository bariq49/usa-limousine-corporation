import { Inject, Injectable } from "@nestjs/common";
import { NotificationType, type Notification } from "@prisma/client";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { NotificationService as AppNotificationService } from "../../notification/services/notification.service";
import { RecipientType, type Client } from "../../notification/types/notification";
import type { BookingNotifyInput } from "../types/notification";

@Injectable()
export class NotificationService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(AppNotificationService) private readonly appNotifications: AppNotificationService,
  ) {}

  async stageCreated(input: BookingNotifyInput, client: Client) {
    const admins = await this.appNotifications.stageForAdmins(
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
    const customer = await this.stageCustomer(
      {
        userId: input.customerUserId,
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
      client,
    );
    return admins.concat(customer);
  }

  async stageCancelled(input: BookingNotifyInput, client: Client) {
    const notifyAdmins = input.notifyAdmins !== false;
    const admins = notifyAdmins
      ? await this.appNotifications.stageForAdmins(
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
        )
      : [];
    const customer = await this.stageCustomer(
      {
        userId: input.customerUserId,
        type: NotificationType.BOOKING_CANCELLED,
        title: "Booking cancelled",
        body: `Your booking ${input.bookingNumber} was cancelled.`,
        data: {
          type: "BOOKING_CANCELLED",
          bookingId: input.bookingId,
          bookingNumber: input.bookingNumber,
        },
        idempotencyKey: `BOOKING_CANCELLED_CUSTOMER:${input.bookingId}`,
      },
      client,
    );
    return admins.concat(customer);
  }

  async stagePaid(input: BookingNotifyInput, client: Client) {
    const admins = await this.appNotifications.stageForAdmins(
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
    const customer = await this.stageCustomer(
      {
        userId: input.customerUserId,
        type: NotificationType.BOOKING_CREATED,
        title: "Booking confirmed",
        body: `Your booking ${input.bookingNumber} is confirmed and paid.`,
        data: {
          type: "BOOKING_CREATED",
          bookingId: input.bookingId,
          bookingNumber: input.bookingNumber,
        },
        idempotencyKey: `BOOKING_PAID_CUSTOMER:${input.bookingId}`,
      },
      client,
    );
    return admins.concat(customer);
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

  async stageCustomer(
    input: {
      userId?: string | null | undefined;
      type: NotificationType;
      title: string;
      body: string;
      data: {
        type: string;
        bookingId: string;
        bookingNumber: string;
      };
      idempotencyKey: string;
    },
    client: Client,
  ) {
    if (!input.userId) {
      return [] as Notification[];
    }
    const customer = await client.customer.findUnique({
      where: { userId: input.userId },
      select: { settings: { select: { notification: true } } },
    });
    if (customer?.settings?.notification === false) {
      return [] as Notification[];
    }
    return this.appNotifications.stage(
      [
        {
          recipientType: RecipientType.USER,
          recipientId: input.userId,
          type: input.type,
          title: input.title,
          body: input.body,
          data: input.data,
          push: true,
          idempotencyKey: input.idempotencyKey,
        },
      ],
      client,
    );
  }
}
