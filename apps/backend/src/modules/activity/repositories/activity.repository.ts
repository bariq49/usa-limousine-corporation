import { Inject, Injectable } from "@nestjs/common";
import type { Activity, Prisma } from "@prisma/client";
import { APIFeature } from "../../../common/api-feature";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import type { Create, List, Owner } from "../types/activity";

@Injectable()
export class ActivityRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  create(input: Create): Promise<Activity> {
    const data: Prisma.ActivityUncheckedCreateInput = {
      customerId: input.customerId,
      type: input.type,
    };

    if (input.actorUserId) {
      data.actorUserId = input.actorUserId;
    }

    if (input.data !== undefined && input.data !== null) {
      data.data = input.data;
    }

    return this.prisma.activity.create({ data });
  }

  list(params: List) {
    const initialFilter: Prisma.ActivityWhereInput = {
      customerId: params.customerId,
    };

    const feature = new APIFeature(params, {
      initialFilter,
      excludeQueryKeys: ["customerId"],
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
            actorUserId: true,
            createdAt: true,
          },
        }),
      count: ({ where }) => this.prisma.activity.count({ where: where as never }),
    });
  }

  count(params: Owner) {
    return this.prisma.activity.count({
      where: { customerId: params.customerId },
    });
  }

  removeByOwner(params: Owner) {
    return this.prisma.activity.deleteMany({
      where: { customerId: params.customerId },
    });
  }
}
