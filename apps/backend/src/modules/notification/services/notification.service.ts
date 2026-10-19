import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { Notification } from "@prisma/client";
import { NotificationRepository } from "../repositories/notification.repository";
import type { Create, MarkRead, Query, Recipient, Remove, RemoveMany } from "../types/notification";
import { NotificationDeliveryService } from "./notification-delivery.service";

@Injectable()
export class NotificationService {
  constructor(
    @Inject(NotificationRepository)
    private readonly repository: NotificationRepository,
    @Inject(NotificationDeliveryService)
    private readonly delivery: NotificationDeliveryService,
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

    await this.delivery.deliver({
      notification,
      push: input.push !== false,
    });
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

    const withPush: Notification[] = [];
    const withoutPush: Notification[] = [];
    for (let index = 0; index < created.length; index += 1) {
      const row = created[index];
      if (!row) {
        continue;
      }
      if (toCreate[index]?.push === false) {
        withoutPush.push(row);
      } else {
        withPush.push(row);
      }
    }

    if (withoutPush.length > 0) {
      await this.delivery.deliverMany({ notifications: withoutPush, push: false });
    }
    if (withPush.length > 0) {
      await this.delivery.deliverMany({ notifications: withPush, push: true });
    }

    return results;
  }

  list(query: Query, recipient: Recipient) {
    return this.repository.list(query, recipient);
  }

  async markRead(params: MarkRead) {
    const existing = await this.repository.findOwned(params);
    if (!existing) {
      throw new NotFoundException("Notification not found");
    }
    if (existing.readAt) {
      return existing;
    }
    return this.repository.markRead({ id: params.id });
  }

  async markAllRead(params: Recipient) {
    const result = await this.repository.markAllRead(params);
    return { updated: result.count };
  }

  async remove(params: Remove) {
    const existing = await this.repository.findOwned(params);
    if (!existing) {
      throw new NotFoundException("Notification not found");
    }
    await this.repository.remove({ id: params.id });
    return { deleted: true, id: params.id };
  }

  async removeMany(params: RemoveMany) {
    const result = await this.repository.removeMany(params);
    return { deleted: result.count };
  }

  countUnread(params: Recipient) {
    return this.repository.countUnread(params);
  }
}
