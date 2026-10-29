import { Inject, Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { APIFeature } from "../../../common/api-feature";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import type { CreateDto, QueryDto, UpdateDto } from "../dto/hourly-pricing.dto";
import { pricingInclude } from "../types/pricing";

@Injectable()
export class HourlyPricingRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.hourlyPricing.findUnique({
      where: { id },
      include: pricingInclude,
    });
  }

  findDuplicate(vehicleCategoryId: string, durationHours: number, excludeId?: string) {
    return this.prisma.hourlyPricing.findFirst({
      where: {
        vehicleCategoryId,
        durationHours,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    });
  }

  findActiveDurations(vehicleCategoryIds: string[]) {
    if (vehicleCategoryIds.length === 0) {
      return Promise.resolve([]);
    }
    return this.prisma.hourlyPricing.findMany({
      where: { status: "ACTIVE", vehicleCategoryId: { in: vehicleCategoryIds } },
      distinct: ["durationHours"],
      select: { durationHours: true },
      orderBy: { durationHours: "asc" },
    });
  }

  findActiveByDuration(durationHours: number, vehicleCategoryIds: string[]) {
    if (vehicleCategoryIds.length === 0) {
      return Promise.resolve([]);
    }
    return this.prisma.hourlyPricing.findMany({
      where: {
        status: "ACTIVE",
        durationHours,
        vehicleCategoryId: { in: vehicleCategoryIds },
      },
    });
  }

  findMany(query: QueryDto) {
    const feature = new APIFeature(query, {
      filterFields: ["vehicleCategoryId", "status", "durationHours"],
      sort: {
        allowedFields: [
          "createdAt",
          "updatedAt",
          "durationHours",
          "basePrice",
          "includedDistance",
          "extraDistanceRate",
          "status",
        ],
        defaultSortBy: "durationHours",
        defaultSortOrder: "asc",
      },
      pagination: {
        defaultLimit: 20,
        maxLimit: 100,
      },
    });

    return feature.execute({
      findMany: (args) =>
        this.prisma.hourlyPricing.findMany({
          where: args.where as never,
          orderBy: args.orderBy as never,
          skip: args.skip,
          take: args.take,
          include: pricingInclude,
        }),
      count: ({ where }) => this.prisma.hourlyPricing.count({ where: where as never }),
    });
  }

  create(data: CreateDto) {
    const createData: Prisma.HourlyPricingUncheckedCreateInput = {
      vehicleCategoryId: data.vehicleCategoryId,
      durationHours: data.durationHours,
      basePrice: data.basePrice,
    };

    if (data.includedDistance !== undefined) {
      createData.includedDistance = data.includedDistance;
    }
    if (data.extraDistanceRate !== undefined) {
      createData.extraDistanceRate = data.extraDistanceRate;
    }
    if (data.status !== undefined) {
      createData.status = data.status;
    }

    return this.prisma.hourlyPricing.create({
      data: createData,
      include: pricingInclude,
    });
  }

  update(id: string, data: UpdateDto) {
    const updateData: Prisma.HourlyPricingUpdateInput = {};

    if (data.vehicleCategoryId !== undefined) {
      updateData.vehicleCategory = { connect: { id: data.vehicleCategoryId } };
    }
    if (data.durationHours !== undefined) {
      updateData.durationHours = data.durationHours;
    }
    if (data.basePrice !== undefined) {
      updateData.basePrice = data.basePrice;
    }
    if (data.includedDistance !== undefined) {
      updateData.includedDistance = data.includedDistance;
    }
    if (data.extraDistanceRate !== undefined) {
      updateData.extraDistanceRate = data.extraDistanceRate;
    }
    if (data.status !== undefined) {
      updateData.status = data.status;
    }

    return this.prisma.hourlyPricing.update({
      where: { id },
      data: updateData,
      include: pricingInclude,
    });
  }

  delete(id: string) {
    return this.prisma.hourlyPricing.delete({
      where: { id },
    });
  }

  bulkDelete(ids: string[]) {
    return this.prisma.hourlyPricing.deleteMany({
      where: { id: { in: ids } },
    });
  }
}
