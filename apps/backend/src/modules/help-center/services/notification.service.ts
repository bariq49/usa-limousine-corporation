import { Inject, Injectable } from "@nestjs/common";
import { HelpTicketSource, HelpTicketStatus, NotificationType, type Notification } from "@prisma/client";
import { stageForAdmins, stageForCustomer } from "../../../common/utils/notification";
import { NotificationService as AppNotificationService } from "../../notification/services/notification.service";
import type { Client } from "../../notification/types/notification";
import type {
  TicketNotifyCreated,
  TicketNotifyCustomerReply,
  TicketNotifyStaffReply,
  TicketNotifyStatusUpdated,
  TicketNotifyWebsiteCreated,
} from "../types/notification";

@Injectable()
export class NotificationService {
  constructor(
    @Inject(AppNotificationService) private readonly appNotifications: AppNotificationService,
  ) {}

  async stageCreated(input: TicketNotifyCreated, tx: Client): Promise<Notification[]> {
    const adminNotifications = await stageForAdmins(
      {
        notificationService: this.appNotifications,
        type: NotificationType.TICKET_CREATED,
        title: "New support ticket",
        body: `${input.ticket.ticketNumber}: ${input.ticket.subject}`,
        data: {
          type: "TICKET_CREATED",
          ticketId: input.ticket.id,
          ticketNumber: input.ticket.ticketNumber,
          customerId: input.ticket.customerId,
        },
        excludeUserId: input.actorUserId ?? null,
        idempotencyKey: `TICKET_CREATED:${input.ticket.id}`,
      },
      tx,
    );

    const customerNotifications = input.ticket.customerId
      ? await stageForCustomer(
          {
            notificationService: this.appNotifications,
            customerId: input.ticket.customerId,
            type: NotificationType.TICKET_CREATED,
            title: "Support ticket received",
            body: `We received your ticket ${input.ticket.ticketNumber}: ${input.ticket.subject}`,
            data: {
              type: "TICKET_CREATED",
              payload: {
                ticketId: input.ticket.id,
                ticketNumber: input.ticket.ticketNumber,
                subject: input.ticket.subject,
              },
            },
            push: true,
            idempotencyKey: `TICKET_CREATED_CUSTOMER:${input.ticket.id}`,
          },
          tx,
        )
      : [];

    return adminNotifications.concat(customerNotifications);
  }

  async stageWebsiteCreated(input: TicketNotifyWebsiteCreated, tx: Client): Promise<Notification[]> {
    const adminNotifications = await stageForAdmins(
      {
        notificationService: this.appNotifications,
        type: NotificationType.TICKET_CREATED,
        title: input.isHigh ? "High priority enquiry" : "New website enquiry",
        body: `${input.ticket.ticketNumber}: ${input.ticket.subject} (${input.contactName})`,
        data: {
          type: "TICKET_CREATED",
          ticketId: input.ticket.id,
          ticketNumber: input.ticket.ticketNumber,
          customerId: input.ticket.customerId,
          source: HelpTicketSource.WEBSITE,
        },
        idempotencyKey: `TICKET_CREATED:${input.ticket.id}`,
      },
      tx,
    );

    const customerNotifications = input.userId
      ? await stageForCustomer(
          {
            notificationService: this.appNotifications,
            userId: input.userId,
            type: NotificationType.TICKET_CREATED,
            title: "Support ticket received",
            body: `We received your ticket ${input.ticket.ticketNumber}: ${input.ticket.subject}`,
            data: {
              type: "TICKET_CREATED",
              payload: {
                ticketId: input.ticket.id,
                ticketNumber: input.ticket.ticketNumber,
                subject: input.ticket.subject,
              },
            },
            push: true,
            idempotencyKey: `TICKET_CREATED_CUSTOMER:${input.ticket.id}`,
          },
          tx,
        )
      : [];

    return adminNotifications.concat(customerNotifications);
  }

  async stageStaffReply(input: TicketNotifyStaffReply, tx: Client): Promise<Notification[]> {
    if (!input.ticket.customerId) {
      return [];
    }

    return stageForCustomer(
      {
        notificationService: this.appNotifications,
        customerId: input.ticket.customerId,
        type: NotificationType.TICKET_REPLY,
        title: "Help ticket reply",
        body: `Support replied to ticket ${input.ticket.ticketNumber}`,
        data: {
          type: "TICKET_REPLY",
          payload: {
            ticketId: input.ticket.id,
            ticketNumber: input.ticket.ticketNumber,
            subject: input.ticket.subject,
            messageId: input.messageId,
          },
        },
        push: true,
        idempotencyKey: `TICKET_REPLY:${input.messageId}`,
      },
      tx,
    );
  }

  async stageCustomerReply(input: TicketNotifyCustomerReply, tx: Client): Promise<Notification[]> {
    return stageForAdmins(
      {
        notificationService: this.appNotifications,
        type: NotificationType.TICKET_REPLY,
        title: "Customer replied",
        body: `${input.ticket.ticketNumber}: ${input.body.slice(0, 120)}`,
        data: {
          type: "TICKET_REPLY",
          ticketId: input.ticket.id,
          ticketNumber: input.ticket.ticketNumber,
          messageId: input.messageId,
        },
        excludeUserId: input.actorUserId ?? null,
        idempotencyKey: `TICKET_CUSTOMER_REPLY:${input.messageId}`,
      },
      tx,
    );
  }

  async stageStatusUpdated(input: TicketNotifyStatusUpdated, tx: Client): Promise<Notification[]> {
    if (!input.ticket.customerId) {
      return [];
    }

    const isResolved = input.to === HelpTicketStatus.RESOLVED;
    const type = isResolved ? NotificationType.TICKET_RESOLVED : NotificationType.TICKET_STATUS_UPDATED;
    const title = isResolved ? "Help ticket resolved" : "Help ticket updated";
    const body = isResolved
      ? `Ticket ${input.ticket.ticketNumber} has been resolved`
      : `Ticket ${input.ticket.ticketNumber} is now ${input.to.toLowerCase().replace(/_/g, " ")}`;

    const payload: Record<string, unknown> = {
      ticketId: input.ticket.id,
      ticketNumber: input.ticket.ticketNumber,
      subject: input.ticket.subject,
    };
    if (isResolved) {
      payload["status"] = input.to;
    } else {
      payload["from"] = input.from;
      payload["to"] = input.to;
    }

    return stageForCustomer(
      {
        notificationService: this.appNotifications,
        customerId: input.ticket.customerId,
        type,
        title,
        body,
        data: {
          type,
          payload: payload as never,
        },
        push: isResolved,
        idempotencyKey: `TICKET_STATUS:${input.ticket.id}:${input.updatedAt.getTime()}`,
      },
      tx,
    );
  }

  deliverStaged(notifications: Notification[]) {
    return this.appNotifications.deliverStaged(notifications);
  }
}
