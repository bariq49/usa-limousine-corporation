import { Inject, Injectable } from "@nestjs/common";
import { Prisma, type Notification } from "@prisma/client";
import { APIFeature } from "../../../common/api-feature";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { DEFAULT_NOTIFICATION_LIMIT, MAX_NOTIFICATION_LIMIT } from "../constants/constants";
import type {
  Client,
  Create,
  CursorPage,
  DeliveryClaim,
  DeliveryStatus,
  DeadLetterPage,
  DeadLetterQuery,
  Id,
  Item,
  MarkRead,
  Owned,
  Query,
  Recipient,
  RemoveMany,
} from "../types/notification";

@Injectable()
export class NotificationRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  create(input: Create, client: Client = this.prisma): Promise<Notification> {
    const data: Prisma.NotificationUncheckedCreateInput = {
      recipientType: input.recipientType,
      recipientId: input.recipientId,
      type: input.type,
      title: input.title,
      body: input.body,
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

  createManyAndReturn(inputs: Create[], client: Client = this.prisma): Promise<Notification[]> {
    if (inputs.length === 0) {
      return Promise.resolve([]);
    }

    return client.notification.createManyAndReturn({
      data: inputs.map((input) => {
        const row: Prisma.NotificationCreateManyInput = {
          recipientType: input.recipientType,
          recipientId: input.recipientId,
          type: input.type,
          title: input.title,
          body: input.body,
        };
        if (input.data !== undefined) {
          row.data = input.data;
        }
        if (input.idempotencyKey !== undefined) {
          row.idempotencyKey = input.idempotencyKey;
        }
        return row;
      }),
      skipDuplicates: true,
    });
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
            select: {
              id: true,
              type: true,
              title: true,
              body: true,
              data: true,
              readAt: true,
              createdAt: true,
            },
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
      select: {
        id: true,
        type: true,
        title: true,
        body: true,
        data: true,
        readAt: true,
        createdAt: true,
      },
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

  findOwned(params: MarkRead): Promise<Owned | null> {
    const { id, recipientType, recipientId } = params;
    return this.prisma.notification.findFirst({
      where: { id, recipientType, recipientId },
      select: {
        id: true,
        type: true,
        title: true,
        body: true,
        data: true,
        readAt: true,
        createdAt: true,
      },
    });
  }

  markRead({ id }: Id): Promise<Item> {
    return this.prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
      select: {
        id: true,
        type: true,
        title: true,
        body: true,
        data: true,
        readAt: true,
        createdAt: true,
      },
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

  markDelivered(ids: string[], lockUntil: Date) {
    if (ids.length === 0) {
      return Promise.resolve({ count: 0 });
    }

    return this.prisma.notification.updateMany({
      where: { id: { in: ids }, deliveredAt: null, deliveryLockedUntil: lockUntil },
      data: { deliveredAt: new Date(), deliveryLockedUntil: null, lastDeliveryError: null },
    });
  }

  claimForDelivery(input: DeliveryClaim): Promise<Notification[]> {
    if (input.ids !== undefined && input.ids.length === 0) {
      return Promise.resolve([]);
    }

    const scope =
      input.ids === undefined
        ? Prisma.sql`candidate."createdAt" < ${input.createdBefore}`
        : Prisma.sql`candidate."id" IN (${Prisma.join(input.ids)})`;
    const limit = input.ids === undefined ? Prisma.sql`LIMIT ${input.take}` : Prisma.empty;

    return this.prisma.$queryRaw<Notification[]>(Prisma.sql`
      UPDATE "Notification" AS notification
      SET
        "deliveryAttempts" = notification."deliveryAttempts" + 1,
        "deliveryLockedUntil" = ${input.lockUntil}
      WHERE notification."id" IN (
        SELECT candidate."id"
        FROM "Notification" AS candidate
        WHERE ${scope}
          AND candidate."deliveredAt" IS NULL
          AND candidate."deadLetteredAt" IS NULL
          AND candidate."nextDeliveryAt" <= ${input.now}
          AND (
            candidate."deliveryLockedUntil" IS NULL
            OR candidate."deliveryLockedUntil" <= ${input.now}
          )
        ORDER BY candidate."createdAt" ASC
        ${limit}
        FOR UPDATE SKIP LOCKED
      )
      RETURNING notification.*
    `);
  }

  markDeliveryFailure(params: {
    id: string;
    lockUntil: Date;
    error: string;
    nextDeliveryAt: Date | null;
    deadLetteredAt: Date | null;
  }) {
    return this.prisma.notification.updateMany({
      where: {
        id: params.id,
        deliveredAt: null,
        deliveryLockedUntil: params.lockUntil,
      },
      data: {
        lastDeliveryError: params.error.slice(0, 1000),
        nextDeliveryAt: params.nextDeliveryAt,
        deadLetteredAt: params.deadLetteredAt,
        deliveryLockedUntil: null,
      },
    });
  }

  async getDeliveryStatus(): Promise<DeliveryStatus> {
    const now = new Date();
    const [pending, retryScheduled, inProgress, deadLettered] = await Promise.all([
      this.prisma.notification.count({
        where: {
          deliveredAt: null,
          deadLetteredAt: null,
          nextDeliveryAt: { lte: now },
          OR: [{ deliveryLockedUntil: null }, { deliveryLockedUntil: { lte: now } }],
        },
      }),
      this.prisma.notification.count({
        where: {
          deliveredAt: null,
          deadLetteredAt: null,
          nextDeliveryAt: { gt: now },
          OR: [{ deliveryLockedUntil: null }, { deliveryLockedUntil: { lte: now } }],
        },
      }),
      this.prisma.notification.count({
        where: {
          deliveredAt: null,
          deadLetteredAt: null,
          deliveryLockedUntil: { gt: now },
        },
      }),
      this.prisma.notification.count({ where: { deadLetteredAt: { not: null } } }),
    ]);

    return { pending, retryScheduled, inProgress, deadLettered };
  }

  async findDeadLetters(query: DeadLetterQuery): Promise<DeadLetterPage> {
    const requested = Number(query.limit) || 50;
    const limit = Math.min(Math.max(requested, 1), 100);
    const args: Prisma.NotificationFindManyArgs = {
      where: { deadLetteredAt: { not: null } },
      select: {
        id: true,
        recipientId: true,
        type: true,
        title: true,
        body: true,
        deliveryAttempts: true,
        deadLetteredAt: true,
        lastDeliveryError: true,
        createdAt: true,
      },
      orderBy: [{ deadLetteredAt: "desc" }, { id: "desc" }],
      take: limit + 1,
    };
    if (query.cursor) {
      const anchor = await this.prisma.notification.findFirst({
        where: { id: query.cursor, deadLetteredAt: { not: null } },
        select: { id: true },
      });
      if (anchor) {
        args.cursor = { id: anchor.id };
        args.skip = 1;
      }
    }

    const rows = await this.prisma.notification.findMany(args);
    const hasNextPage = rows.length > limit;
    const items = hasNextPage ? rows.slice(0, limit) : rows;
    const last = items[items.length - 1];

    return {
      items,
      hasNextPage,
      nextCursor: hasNextPage && last ? last.id : null,
    };
  }

  async requeueDeadLetter(id: string): Promise<Notification | null> {
    const result = await this.prisma.notification.updateMany({
      where: { id, deadLetteredAt: { not: null }, deliveredAt: null },
      data: {
        deliveryAttempts: 0,
        nextDeliveryAt: new Date(),
        deliveryLockedUntil: null,
        deadLetteredAt: null,
        lastDeliveryError: null,
      },
    });
    if (result.count === 0) {
      return null;
    }

    return this.prisma.notification.findUnique({ where: { id } });
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
