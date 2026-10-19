import { Inject, Injectable } from "@nestjs/common";
import type { Prisma, Audience } from "@prisma/client";
import { APIFeature } from "../../../common/api-feature";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import type { QueryDto } from "../dto/query.dto";
import type { CreateData, UpdateData } from "../types/plan";

@Injectable()
export class PlanRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.subscriptionPlan.findUnique({ where: { id } });
  }

  listActive(audience: Audience) {
    return this.prisma.subscriptionPlan.findMany({
      where: { audience, isActive: true },
      orderBy: { sortOrder: "asc" },
    });
  }

  findMany(query: QueryDto) {
    const initialFilter: Prisma.SubscriptionPlanWhereInput = {};
    if (query.audience !== undefined) {
      initialFilter.audience = query.audience;
    }

    const feature = new APIFeature(query, {
      initialFilter,
      filterFields: ["isActive", "audience", "isPopular"],
      search: {
        searchFields: ["name", "description"],
      },
      sort: {
        allowedFields: [
          "createdAt",
          "updatedAt",
          "name",
          "sortOrder",
          "freeMonths",
          "freeDays",
          "amount",
        ],
        defaultSortBy: "sortOrder",
        defaultSortOrder: "asc",
      },
      pagination: {
        defaultLimit: 20,
        maxLimit: 100,
      },
    });

    return feature.execute({
      findMany: (args) =>
        this.prisma.subscriptionPlan.findMany({
          where: args.where as never,
          orderBy: args.orderBy as never,
          skip: args.skip,
          take: args.take,
        }),
      count: ({ where }) => this.prisma.subscriptionPlan.count({ where: where as never }),
    });
  }

  create(data: CreateData) {
    return this.prisma.subscriptionPlan.create({
      data: {
        audience: data.audience,
        name: data.name,
        description: data.description,
        interval: data.interval,
        amount: data.amount,
        tripsPerMonth: data.tripsPerMonth,
        features: data.features,
        freeMonths: data.freeMonths,
        freeDays: data.freeDays,
        graceDays: data.graceDays,
        isPopular: data.isPopular,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
      },
    });
  }

  update(id: string, data: UpdateData) {
    const updateData: Prisma.SubscriptionPlanUpdateInput = {};
    if (data.name !== undefined) {
      updateData.name = data.name;
    }
    if (data.description !== undefined) {
      updateData.description = data.description;
    }
    if (data.interval !== undefined) {
      updateData.interval = data.interval;
    }
    if (data.amount !== undefined) {
      updateData.amount = data.amount;
    }
    if (data.tripsPerMonth !== undefined) {
      updateData.tripsPerMonth = data.tripsPerMonth;
    }
    if (data.features !== undefined) {
      updateData.features = data.features;
    }
    if (data.freeMonths !== undefined) {
      updateData.freeMonths = data.freeMonths;
    }
    if (data.freeDays !== undefined) {
      updateData.freeDays = data.freeDays;
    }
    if (data.graceDays !== undefined) {
      updateData.graceDays = data.graceDays;
    }
    if (data.isPopular !== undefined) {
      updateData.isPopular = data.isPopular;
    }
    if (data.isActive !== undefined) {
      updateData.isActive = data.isActive;
    }
    if (data.sortOrder !== undefined) {
      updateData.sortOrder = data.sortOrder;
    }

    return this.prisma.subscriptionPlan.update({
      where: { id },
      data: updateData,
    });
  }

  delete(id: string) {
    return this.prisma.subscriptionPlan.delete({ where: { id } });
  }

  async countReferences(id: string) {
    const [subscriptions, periods] = await Promise.all([
      this.prisma.subscription.count({ where: { planId: id } }),
      this.prisma.subscriptionPeriod.count({ where: { planId: id } }),
    ]);
    return subscriptions + periods;
  }
}
