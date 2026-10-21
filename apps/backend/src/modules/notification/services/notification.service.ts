import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { Notification } from "@prisma/client";
import { NotificationRepository } from "../repositories/notification.repository";
import {
  type Client,
  type Create,
  type MarkRead,
  type NotifyAdmins,
  type Query,
  type Recipient,
  RecipientType,
  type Remove,
  type RemoveMany,
} from "../types/notification";
import { NotificationRealtimeService } from "../websocket/notification-realtime.service";
import { NotificationDeliveryService } from "./notification-delivery.service";

@Injectable()
export class NotificationService {
  constructor(
    @Inject(NotificationRepository)
    private readonly repository: NotificationRepository,
    @Inject(NotificationDeliveryService)
    private readonly delivery: NotificationDeliveryService,
    @Inject(NotificationRealtimeService)
    private readonly realtime: NotificationRealtimeService,
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

    await this.delivery.deliver({ notification });
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

    const created = await this.repository.createManyAndReturn({ inputs: toCreate });
    for (const row of created) {
      results.push(row);
    }

    await this.delivery.deliverMany({ notifications: created });
    return results;
  }

  /**
   * Transactional outbox: insert rows with the caller's transaction so they commit (or roll back)
   * together with the business change. Call `deliverStaged` after the transaction commits; if the
   * process dies first, the sweep job delivers them.
   */
  stage(inputs: Create[], client: Client) {
    return this.repository.createManyAndReturn({ inputs }, client);
  }

  /** Stage one in-app notification per active super admin (no push). */
  async stageForAdmins(input: NotifyAdmins, client: Client) {
    const adminIds = await this.repository.findAdminUserIds(input.excludeUserId, client);
    return this.stage(
      adminIds.map((id) => ({
        recipientType: RecipientType.USER,
        recipientId: id,
        type: input.type,
        title: input.title,
        body: input.body,
        data: input.data,
        push: false,
        idempotencyKey: `${input.idempotencyKey}:${id}`,
      })),
      client,
    );
  }

  deliverStaged(notifications: Notification[]) {
    return this.delivery.deliverMany({ notifications });
  }

  list(query: Query, recipient: Recipient) {
    return this.repository.list(query, recipient);
  }

  /**
   * A page of the recipient's notifications plus their unread count.
   * With `cursor` (empty string for the first page) it uses keyset paging and skips the total count.
   */
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

  countUnread(params: Recipient) {
    return this.repository.countUnread(params);
  }
}
