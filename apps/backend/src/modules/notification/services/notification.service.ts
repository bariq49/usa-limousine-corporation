import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { Notification } from "@prisma/client";
import { AppLogger } from "../../../common/logger/app.logger";
import {
  DELIVERY_LEASE_MS,
  DELIVERY_MAX_ATTEMPTS,
  DELIVERY_RETRY_BASE_MS,
  DELIVERY_RETRY_MAX_MS,
  DELIVER_PENDING_BATCH,
} from "../constants/constants";
import { NotificationRepository } from "../repositories/notification.repository";
import {
  type Create,
  type DeadLetterQuery,
  type DeliveryClaim,
  type DeliveryResult,
  type DeliveryStatus,
  type MarkRead,
  type Query,
  type Recipient,
  type Remove,
  type RemoveMany,
} from "../types/notification";
import { NotificationRealtimeService } from "../websocket/notification-realtime.service";

@Injectable()
export class NotificationService {
  constructor(
    @Inject(NotificationRepository)
    private readonly repository: NotificationRepository,
    @Inject(NotificationRealtimeService)
    private readonly realtime: NotificationRealtimeService,
    @Inject(AppLogger) private readonly logger: AppLogger,
  ) {}

  async notify(input: Create) {
    if (input.idempotencyKey) {
      const existing = await this.repository.findByIdempotencyKey(input.idempotencyKey);
      if (existing) {
        return existing;
      }
    }

    let notification: Notification;
    try {
      notification = await this.repository.create(input);
    } catch (error) {
      if (
        input.idempotencyKey &&
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        const existing = await this.repository.findByIdempotencyKey(input.idempotencyKey);
        if (existing) {
          return existing;
        }
      }
      throw error;
    }

    await this.deliverStaged([notification]);
    return notification;
  }

  async notifyMany(inputs: Create[]) {
    if (inputs.length === 0) {
      return [] as Notification[];
    }

    const keys = inputs
      .map((i) => i.idempotencyKey)
      .filter((k): k is string => typeof k === "string" && k.length > 0);
    const existing = await this.repository.findByIdempotencyKeys(keys);
    const existingByKey = new Map(
      existing.filter((n) => n.idempotencyKey).map((n) => [n.idempotencyKey as string, n]),
    );

    const toCreate: Create[] = [];
    const results: Notification[] = [];

    for (const input of inputs) {
      if (input.idempotencyKey) {
        const hit = existingByKey.get(input.idempotencyKey);
        if (hit) {
          results.push(hit);
          continue;
        }
      }
      toCreate.push(input);
    }

    if (toCreate.length === 0) {
      return results;
    }

    const created = await this.repository.createManyAndReturn(toCreate);
    for (const row of created) {
      results.push(row);
    }

    await this.deliverStaged(created);
    return results;
  }

  stage(inputs: Create[], client: Prisma.TransactionClient) {
    return this.repository.createManyAndReturn(inputs, client);
  }

  async deliverStaged(notifications: Notification[]) {
    if (notifications.length === 0) {
      return;
    }

    const now = new Date();
    const lockUntil = new Date(now.getTime() + DELIVERY_LEASE_MS);
    const claimed = await this.claimForDelivery(
      {
        ids: notifications.map((notification) => notification.id),
        now,
        lockUntil,
        take: notifications.length,
      },
      "staged",
    );
    await this.dispatchClaimed(claimed, lockUntil);
  }

  async deliverPending(createdBefore: Date, take = DELIVER_PENDING_BATCH): Promise<DeliveryResult> {
    const now = new Date();
    const lockUntil = new Date(now.getTime() + DELIVERY_LEASE_MS);
    const claimed = await this.claimForDelivery({ createdBefore, now, lockUntil, take }, "pending");
    return this.dispatchClaimed(claimed, lockUntil);
  }

  getDeliveryStatus(): Promise<DeliveryStatus> {
    return this.repository.getDeliveryStatus();
  }

  listDeadLetters(query: DeadLetterQuery) {
    return this.repository.findDeadLetters(query);
  }

  async retryDeadLetter(id: string, userId: string) {
    const notification = await this.repository.requeueDeadLetter(id);
    if (!notification) {
      throw new NotFoundException("Dead-letter notification not found");
    }

    this.logger.warn(
      `notification.dead-letter.retry id=${id} requestedBy=${userId}`,
      NotificationService.name,
    );
    await this.deliverStaged([notification]);
    return { requeued: true, id };
  }

  async listWithUnread(query: Query, recipient: Recipient) {
    if (query.cursor !== undefined) {
      const [page, unreadCount] = await Promise.all([
        this.repository.listByCursor(query, recipient),
        this.repository.countUnread(recipient),
      ]);
      return {
        items: page.items,
        nextCursor: page.nextCursor,
        hasNextPage: page.hasNextPage,
        unreadCount,
      };
    }

    const [result, unreadCount] = await Promise.all([
      this.repository.list(query, recipient),
      this.repository.countUnread(recipient),
    ]);
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

  async markRead(params: MarkRead) {
    const existing = await this.repository.findOwned(params);
    if (!existing) {
      throw new NotFoundException("Notification not found");
    }
    if (existing.readAt) {
      return existing;
    }

    const updated = await this.repository.markRead({ id: params.id });
    const unreadCount = await this.repository.countUnread(params);
    this.realtime.emitRead(
      { recipientType: params.recipientType, recipientId: params.recipientId, ids: [params.id] },
      unreadCount,
    );
    return updated;
  }

  async markAllRead(params: Recipient) {
    const result = await this.repository.markAllRead(params);
    if (result.count > 0) {
      this.realtime.emitRead(
        { recipientType: params.recipientType, recipientId: params.recipientId, ids: null },
        0,
      );
    }
    return { updated: result.count };
  }

  async remove(params: Remove) {
    const existing = await this.repository.findOwned(params);
    if (!existing) {
      throw new NotFoundException("Notification not found");
    }

    await this.repository.remove({ id: params.id });
    const unreadCount = await this.repository.countUnread(params);
    this.realtime.emitRemoved(
      { recipientType: params.recipientType, recipientId: params.recipientId, ids: [params.id] },
      unreadCount,
    );
    return { deleted: true, id: params.id };
  }

  async removeMany(params: RemoveMany) {
    const result = await this.repository.removeMany(params);
    if (result.count > 0) {
      const unreadCount = await this.repository.countUnread(params);
      this.realtime.emitRemoved(
        { recipientType: params.recipientType, recipientId: params.recipientId, ids: params.ids },
        unreadCount,
      );
    }
    return { deleted: result.count };
  }

  private async claimForDelivery(input: DeliveryClaim, source: string): Promise<Notification[]> {
    try {
      return await this.repository.claimForDelivery(input);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      this.logger.error(
        `Notification ${source} claim failed: ${message}`,
        undefined,
        NotificationService.name,
      );
      return [];
    }
  }

  private async dispatchClaimed(
    notifications: Notification[],
    lockUntil: Date,
  ): Promise<DeliveryResult> {
    const deliveredIds: string[] = [];
    const failed: { notification: Notification; error: string }[] = [];

    for (const notification of notifications) {
      try {
        if (this.realtime.emitCreated(notification)) {
          deliveredIds.push(notification.id);
        } else {
          failed.push({ notification, error: "Realtime transport unavailable" });
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        this.logger.error(
          `Notification realtime delivery failed for ${notification.id}: ${message}`,
          undefined,
          NotificationService.name,
        );
        failed.push({ notification, error: message });
      }
    }

    let delivered = 0;
    if (deliveredIds.length > 0) {
      try {
        const result = await this.repository.markDelivered(deliveredIds, lockUntil);
        delivered = result.count;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        this.logger.error(
          `Notification delivery status update failed: ${message}`,
          undefined,
          NotificationService.name,
        );
      }
    }

    let deadLettered = 0;
    for (const failure of failed) {
      const terminal = failure.notification.deliveryAttempts >= DELIVERY_MAX_ATTEMPTS;
      const retryWindow = Math.min(
        DELIVERY_RETRY_BASE_MS * 2 ** (failure.notification.deliveryAttempts - 1),
        DELIVERY_RETRY_MAX_MS,
      );
      try {
        const result = await this.repository.markDeliveryFailure({
          id: failure.notification.id,
          lockUntil,
          error: failure.error,
          nextDeliveryAt: terminal ? null : new Date(Date.now() + retryWindow),
          deadLetteredAt: terminal ? new Date() : null,
        });
        if (result.count > 0 && terminal) {
          deadLettered += result.count;
          this.logger.error(
            `Notification moved to dead letter id=${failure.notification.id} attempts=${failure.notification.deliveryAttempts}`,
            undefined,
            NotificationService.name,
          );
        } else if (result.count > 0) {
          this.logger.warn(
            `Notification delivery scheduled for retry id=${failure.notification.id} attempts=${failure.notification.deliveryAttempts}`,
            NotificationService.name,
          );
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        this.logger.error(
          `Notification delivery failure could not be recorded for ${failure.notification.id}: ${message}`,
          undefined,
          NotificationService.name,
        );
      }
    }

    return {
      claimed: notifications.length,
      delivered,
      failed: notifications.length - delivered,
      deadLettered,
    };
  }
}
