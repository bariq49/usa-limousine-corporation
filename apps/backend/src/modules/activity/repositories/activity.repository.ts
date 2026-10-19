import { Inject, Injectable } from "@nestjs/common";
import type { Activity, Prisma } from "@prisma/client";
import { APIFeature } from "../../../common/api-feature";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import type { Create, List, Owner } from "../types/activity";

@Injectable()
export class ActivityRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  create(input: Create): Promise<Activity> {
    const data: Prisma.ActivityCreateInput = {
      ownerType: input.ownerType,
      ownerId: input.ownerId,
      type: input.type,
    };

    if (input.actorType) {
      data.actorType = input.actorType;
    }

    if (input.actorId) {
      data.actorId = input.actorId;
    }

    if (input.data !== undefined && input.data !== null) {
      data.data = input.data;
    }

    return this.prisma.activity.create({ data });
  }

  list(params: List) {
    const { ownerType, ownerId, ...query } = params;
    const initialFilter: Prisma.ActivityWhereInput = {
      ownerType,
      ownerId,
    };

    const feature = new APIFeature(query, {
      initialFilter,
      filterFields: ["type"],
      search: {
        searchFields: ["type"],
      },
      sort: {
        allowedFields: ["createdAt", "type"],
        defaultSortBy: "createdAt",
        defaultSortOrder: "desc",
      },
      pagination: {
        defaultLimit: 10,
        maxLimit: 100,
      },
      dateRange: {
        field: "createdAt",
      },
    });

    return feature.execute({
      findMany: (args) =>
        this.prisma.activity.findMany({
          where: args.where as never,
          orderBy: args.orderBy as never,
          skip: args.skip,
          take: args.take,
          select: {
            id: true,
            type: true,
            data: true,
            actorType: true,
            actorId: true,
            createdAt: true,
          },
        }),
      count: ({ where }) => this.prisma.activity.count({ where: where as never }),
    });
  }

  count(params: Owner) {
    const { ownerType, ownerId } = params;
    return this.prisma.activity.count({
      where: { ownerType, ownerId },
    });
  }

  removeByOwner(params: Owner) {
    const { ownerType, ownerId } = params;
    return this.prisma.activity.deleteMany({
      where: { ownerType, ownerId },
    });
  }
}
