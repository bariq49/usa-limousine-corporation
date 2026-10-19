import { Inject, Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { APIFeature } from "../../../common/api-feature";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import type { CreatePricingDto } from "../dto/create-pricing.dto";
import type { PricingQueryDto } from "../dto/pricing-query.dto";
import type { UpdatePricingDto } from "../dto/update-pricing.dto";

const pricingInclude = {
  vehicleCategory: {
    select: {
      id: true,
      name: true,
      image: true,
      passengerCount: true,
    },
  },
} as const;

@Injectable()
export class PricingRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.vehicleCategoryPricing.findUnique({
      where: { id },
      include: pricingInclude,
    });
  }

  findForDistance(vehicleCategoryId: string, distance: number) {
    return this.prisma.vehicleCategoryPricing.findFirst({
      where: {
        vehicleCategoryId,
        status: "ACTIVE",
        minimumDistance: { lte: distance },
        OR: [{ maximumDistance: null }, { maximumDistance: { gt: distance } }],
      },
      orderBy: [{ minimumDistance: "desc" }],
      include: pricingInclude,
    });
  }

  findAllForDistance(distance: number, vehicleCategoryIds: string[]) {
    if (vehicleCategoryIds.length === 0) {
      return Promise.resolve([]);
    }
    return this.prisma.vehicleCategoryPricing.findMany({
      where: {
        vehicleCategoryId: { in: vehicleCategoryIds },
        status: "ACTIVE",
        minimumDistance: { lte: distance },
        OR: [{ maximumDistance: null }, { maximumDistance: { gt: distance } }],
      },
      orderBy: [{ minimumDistance: "desc" }],
    });
  }

  findMany(query: PricingQueryDto) {
    const feature = new APIFeature(query, {
      filterFields: ["vehicleCategoryId", "status", "pricingType"],
      sort: {
        allowedFields: [
          "createdAt",
          "updatedAt",
          "minimumDistance",
          "maximumDistance",
          "basePrice",
          "perUnitRate",
          "percentageRate",
          "status",
        ],
        defaultSortBy: "minimumDistance",
        defaultSortOrder: "asc",
      },
      pagination: {
        defaultLimit: 20,
        maxLimit: 100,
      },
    });

    return feature.execute({
      findMany: (args) =>
        this.prisma.vehicleCategoryPricing.findMany({
          where: args.where as never,
          orderBy: args.orderBy as never,
          skip: args.skip,
          take: args.take,
          include: pricingInclude,
        }),
      count: ({ where }) => this.prisma.vehicleCategoryPricing.count({ where: where as never }),
    });
  }

  create(data: CreatePricingDto) {
    const createData: Prisma.VehicleCategoryPricingUncheckedCreateInput = {
      vehicleCategoryId: data.vehicleCategoryId,
      minimumDistance: data.minimumDistance,
      pricingType: data.pricingType,
      basePrice: data.basePrice,
    };

    if (data.maximumDistance !== undefined) {
      createData.maximumDistance = data.maximumDistance;
    }
    if (data.perUnitRate !== undefined) {
      createData.perUnitRate = data.perUnitRate;
    }
    if (data.percentageRate !== undefined) {
      createData.percentageRate = data.percentageRate;
    }
    if (data.status !== undefined) {
      createData.status = data.status;
    }

    return this.prisma.vehicleCategoryPricing.create({
      data: createData,
      include: pricingInclude,
    });
  }

  update(id: string, data: UpdatePricingDto) {
    const updateData: Prisma.VehicleCategoryPricingUpdateInput = {};

    if (data.vehicleCategoryId !== undefined) {
      updateData.vehicleCategory = { connect: { id: data.vehicleCategoryId } };
    }
    if (data.minimumDistance !== undefined) {
      updateData.minimumDistance = data.minimumDistance;
    }
    if (data.maximumDistance !== undefined) {
      updateData.maximumDistance = data.maximumDistance;
    }
    if (data.pricingType !== undefined) {
      updateData.pricingType = data.pricingType;
    }
    if (data.basePrice !== undefined) {
      updateData.basePrice = data.basePrice;
    }
    if (data.perUnitRate !== undefined) {
      updateData.perUnitRate = data.perUnitRate;
    }
    if (data.percentageRate !== undefined) {
      updateData.percentageRate = data.percentageRate;
    }
    if (data.status !== undefined) {
      updateData.status = data.status;
    }

    return this.prisma.vehicleCategoryPricing.update({
      where: { id },
      data: updateData,
      include: pricingInclude,
    });
  }

  delete(id: string) {
    return this.prisma.vehicleCategoryPricing.delete({
      where: { id },
    });
  }

  bulkDelete(ids: string[]) {
    return this.prisma.vehicleCategoryPricing.deleteMany({
      where: { id: { in: ids } },
    });
  }
}
