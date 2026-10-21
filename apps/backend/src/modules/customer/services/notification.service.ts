import { Inject, Injectable } from "@nestjs/common";
import type { Request } from "express";
import { NotificationService } from "../../notification/services/notification.service";
import { RecipientType } from "../../notification/types/notification";
import type { BulkDeleteDto, QueryDto } from "../../notification/dto/notification.dto";
import { CustomerRepository } from "../repositories/customer.repository";
import { requireCustomer } from "../utils/require-customer";

@Injectable()
export class CustomerNotificationService {
  constructor(
    @Inject(CustomerRepository) private readonly customers: CustomerRepository,
    @Inject(NotificationService) private readonly notifications: NotificationService,
  ) {}

  async listNotifications(query: QueryDto, request: Request) {
    const customer = await requireCustomer(this.customers, request);
    const recipient = {
      recipientType: RecipientType.USER,
      recipientId: customer.userId,
    };

    return this.notifications.listWithUnread(query, recipient);
  }

  async markNotificationRead(id: string, request: Request) {
    const customer = await requireCustomer(this.customers, request);
    return this.notifications.markRead({
      recipientType: RecipientType.USER,
      recipientId: customer.userId,
      id,
    });
  }

  async markAllNotificationsRead(request: Request) {
    const customer = await requireCustomer(this.customers, request);
    return this.notifications.markAllRead({
      recipientType: RecipientType.USER,
      recipientId: customer.userId,
    });
  }

  async removeNotification(id: string, request: Request) {
    const customer = await requireCustomer(this.customers, request);
    return this.notifications.remove({
      recipientType: RecipientType.USER,
      recipientId: customer.userId,
      id,
    });
  }

  async removeNotifications(body: BulkDeleteDto, request: Request) {
    const customer = await requireCustomer(this.customers, request);
    return this.notifications.removeMany({
      recipientType: RecipientType.USER,
      recipientId: customer.userId,
      ids: body.ids,
    });
  }
}
