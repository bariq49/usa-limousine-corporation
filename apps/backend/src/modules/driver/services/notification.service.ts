import { Inject, Injectable } from "@nestjs/common";
import type { Request } from "express";
import { NotificationService } from "../../notification/services/notification.service";
import { RecipientType } from "../../notification/types/notification";
import type { BulkDeleteDto, QueryDto } from "../dto/notification.dto";
import { DriverRepository } from "../repositories/driver.repository";
import { requireDriver } from "../utils/require-driver";

@Injectable()
export class DriverNotificationService {
  constructor(
    @Inject(DriverRepository) private readonly driverRepository: DriverRepository,
    @Inject(NotificationService) private readonly notificationService: NotificationService,
  ) {}

  async listNotifications(query: QueryDto, request: Request) {
    const driver = await requireDriver(this.driverRepository, request);
    const recipient = {
      recipientType: RecipientType.DRIVER,
      recipientId: driver.id,
    };

    const result = await this.notificationService.list(query, recipient);
    const unreadCount = await this.notificationService.countUnread(recipient);

    return {
      items: result.items,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage,
      unreadCount,
    };
  }

  async markNotificationRead(id: string, request: Request) {
    const driver = await requireDriver(this.driverRepository, request);

    return this.notificationService.markRead({
      recipientType: RecipientType.DRIVER,
      recipientId: driver.id,
      id,
    });
  }

  async markAllNotificationsRead(request: Request) {
    const driver = await requireDriver(this.driverRepository, request);

    return this.notificationService.markAllRead({
      recipientType: RecipientType.DRIVER,
      recipientId: driver.id,
    });
  }

  async removeNotification(id: string, request: Request) {
    const driver = await requireDriver(this.driverRepository, request);

    return this.notificationService.remove({
      recipientType: RecipientType.DRIVER,
      recipientId: driver.id,
      id,
    });
  }

  async removeNotifications(body: BulkDeleteDto, request: Request) {
    const driver = await requireDriver(this.driverRepository, request);

    return this.notificationService.removeMany({
      recipientType: RecipientType.DRIVER,
      recipientId: driver.id,
      ids: body.ids,
    });
  }
}
