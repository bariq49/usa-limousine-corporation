import { Inject, Injectable } from "@nestjs/common";
import { type Notification, type Prisma, RoleKey } from "@prisma/client";
import { APIFeature } from "../../../common/api-feature";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import {
  DEFAULT_NOTIFICATION_LIMIT,
  MAX_NOTIFICATION_LIMIT,
} from "../constants/notification.constants";
import type {
  Client,
  Create,
  CreateMany,
  CursorPage,
  Id,
  MarkRead,
  Query,
  Recipient,
  RemoveMany,
} from "../types/notification";

@Injectable()
export class NotificationRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  findAdminUserIds(excludeUserId?: string | null, client: Client = this.prisma) {
    const where: Prisma.UserWhereInput = {
      isActive: true,
      roles: { some: { role: { key: RoleKey.SUPER_ADMIN } } },
    };
    if (excludeUserId) {
      where.id = { not: excludeUserId };
    }

    return client.user
      .findMany({ where, select: { id: true } })
      .then((rows) => rows.map((row) => row.id));
  }

  create(input: Create, client: Client = this.prisma): Promise<Notification> {
    const data: Prisma.NotificationUncheckedCreateInput = {
      recipientType: input.recipientType,
      recipientId: input.recipientId,
      type: input.type,
      title: input.title,
      body: input.body,
      push: input.push !== false,
    };
    if (input.data !== undefined) {
      data.data = input.data;
    }
    if (input.idempotencyKey !== undefined) {
      data.idempotencyKey = input.idempotencyKey;
    }

    return client.notification.create({ data });
  }

  findByIdempotencyKey(idempotencyKey: string): Promise<Notification | null> {
    return this.prisma.notification.findUnique({
      where: { idempotencyKey },
    });
  }

  findByIdempotencyKeys(keys: string[]): Promise<Notification[]> {
    if (keys.length === 0) {
      return Promise.resolve([]);
    }
    return this.prisma.notification.findMany({
      where: { idempotencyKey: { in: keys } },
    });
  }

  createMany({ inputs }: CreateMany) {
    if (inputs.length === 0) {
      return Promise.resolve({ count: 0 });
    }

    return this.prisma.notification.createMany({
      data: inputs.map((input) => this.toCreateManyRow(input)),
    });
  }

  /** Rows whose idempotency key already exists are skipped and not returned. */
  createManyAndReturn(
    { inputs }: CreateMany,
    client: Client = this.prisma,
  ): Promise<Notification[]> {
    if (inputs.length === 0) {
      return Promise.resolve([]);
    }

    return client.notification.createManyAndReturn({
      data: inputs.map((input) => this.toCreateManyRow(input)),
      skipDuplicates: true,
    });
  }

  private toCreateManyRow(input: Create): Prisma.NotificationCreateManyInput {
    const row: Prisma.NotificationCreateManyInput = {
      recipientType: input.recipientType,
      recipientId: input.recipientId,
      type: input.type,
      title: input.title,
      body: input.body,
      push: input.push !== false,
    };
    if (input.data !== undefined) {
      row.data = input.data;
    }
    if (input.idempotencyKey !== undefined) {
      row.idempotencyKey = input.idempotencyKey;
    }
    return row;
  }

  list(query: Query, recipient: Recipient) {
    const initialFilter: Prisma.NotificationWhereInput = {
      recipientType: recipient.recipientType,
      recipientId: recipient.recipientId,
    };
    if (query.unreadOnly) {
      initialFilter.readAt = null;
    }

    const feature = new APIFeature(query, {
      initialFilter,
      excludeQueryKeys: ["unreadOnly"],
      filterFields: ["type"],
      search: {
        searchFields: ["title", "body"],
      },
      sort: {
        allowedFields: ["createdAt", "readAt"],
        defaultSortBy: "createdAt",
        defaultSortOrder: "desc",
      },
      pagination: {
        defaultLimit: DEFAULT_NOTIFICATION_LIMIT,
        maxLimit: MAX_NOTIFICATION_LIMIT,
      },
      dateRange: {
        field: "createdAt",
      },
    });

    return feature
      .execute({
        findMany: (args) =>
          this.prisma.notification.findMany({
            where: args.where as never,
            orderBy: args.orderBy as never,
            skip: args.skip,
            take: args.take,
          }),
        count: ({ where }) => this.prisma.notification.count({ where: where as never }),
      })
      .then((result) => ({
        items: result.data,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.pages,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
      }));
  }

  /** Keyset page ordered newest first; no total count, so it stays fast for large inboxes. */
  async listByCursor(query: Query, recipient: Recipient): Promise<CursorPage> {
    const requested = Number(query.limit) || DEFAULT_NOTIFICATION_LIMIT;
    const limit = Math.min(Math.max(requested, 1), MAX_NOTIFICATION_LIMIT);

    const where: Prisma.NotificationWhereInput = {
      recipientType: recipient.recipientType,
      recipientId: recipient.recipientId,
    };
    if (query.unreadOnly) {
      where.readAt = null;
    }
    if (query.type) {
      where.type = query.type;
    }
    if (query.cursor) {
      const anchor = await this.prisma.notification.findFirst({
        where: {
          id: query.cursor,
          recipientType: recipient.recipientType,
          recipientId: recipient.recipientId,
        },
        select: { id: true, createdAt: true },
      });
      if (anchor) {
        where.OR = [
          { createdAt: { lt: anchor.createdAt } },
          { createdAt: anchor.createdAt, id: { lt: anchor.id } },
        ];
      }
    }

    const rows = await this.prisma.notification.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1,
    });

    const hasNextPage = rows.length > limit;
    const items = hasNextPage ? rows.slice(0, limit) : rows;
    const last = items[items.length - 1];

    return {
      items,
      hasNextPage,
      nextCursor: hasNextPage && last ? last.id : null,
    };
  }

  findOwned(params: MarkRead): Promise<Notification | null> {
    const { id, recipientType, recipientId } = params;
    return this.prisma.notification.findFirst({
      where: { id, recipientType, recipientId },
    });
  }

  markRead({ id }: Id): Promise<Notification> {
    return this.prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    });
  }

  markAllRead(params: Recipient) {
    const { recipientType, recipientId } = params;
    return this.prisma.notification.updateMany({
      where: {
        recipientType,
        recipientId,
        readAt: null,
      },
      data: { readAt: new Date() },
    });
  }

  countUnread(params: Recipient) {
    const { recipientType, recipientId } = params;
    return this.prisma.notification.count({
      where: {
        recipientType,
        recipientId,
        readAt: null,
      },
    });
  }

  remove({ id }: Id): Promise<Notification> {
    return this.prisma.notification.delete({
      where: { id },
    });
  }

  removeMany(params: RemoveMany) {
    const { ids, recipientType, recipientId } = params;
    if (ids.length === 0) {
      return Promise.resolve({ count: 0 });
    }

    return this.prisma.notification.deleteMany({
      where: {
        id: { in: ids },
        recipientType,
        recipientId,
      },
    });
  }

  markDelivered(ids: string[]) {
    if (ids.length === 0) {
      return Promise.resolve({ count: 0 });
    }

    return this.prisma.notification.updateMany({
      where: { id: { in: ids }, deliveredAt: null },
      data: { deliveredAt: new Date() },
    });
  }

  findUndelivered(createdBefore: Date, take: number): Promise<Notification[]> {
    return this.prisma.notification.findMany({
      where: { deliveredAt: null, createdAt: { lt: createdBefore } },
      orderBy: { createdAt: "asc" },
      take,
    });
  }

  deleteExpired(readBefore: Date, unreadBefore: Date) {
    return this.prisma.notification.deleteMany({
      where: {
        OR: [
          { readAt: { not: null }, createdAt: { lt: readBefore } },
          { readAt: null, createdAt: { lt: unreadBefore } },
        ],
      },
    });
  }
}
