import { Inject, Injectable } from "@nestjs/common";
import type { Notification, Prisma } from "@prisma/client";
import { APIFeature } from "../../../common/api-feature";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import {
  DEFAULT_NOTIFICATION_LIMIT,
  MAX_NOTIFICATION_LIMIT,
} from "../constants/notification.constants";
import type {
  Create,
  CreateMany,
  Id,
  MarkRead,
  Query,
  Recipient,
  RemoveMany,
} from "../types/notification";

@Injectable()
export class NotificationRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  create(input: Create): Promise<Notification> {
    const data: Prisma.NotificationCreateInput = {
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

    return this.prisma.notification.create({ data });
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

  createManyAndReturn({ inputs }: CreateMany): Promise<Notification[]> {
    if (inputs.length === 0) {
      return Promise.resolve([]);
    }

    return this.prisma.notification.createManyAndReturn({
      data: inputs.map((input) => this.toCreateManyRow(input)),
    });
  }

  private toCreateManyRow(input: Create): Prisma.NotificationCreateManyInput {
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
}
