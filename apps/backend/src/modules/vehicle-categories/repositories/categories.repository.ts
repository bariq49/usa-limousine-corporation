import { Inject, Injectable } from "@nestjs/common";
import { APIFeature } from "../../../common/api-feature";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import type { CreateDto } from "../dto/create.dto";
import type { VehicleCategoryLuggageCapacityInput } from "../dto/luggage-capacity.dto";
import type { VehicleCategoryQueryDto } from "../dto/query.dto";
import type { UpdateDto } from "../dto/update.dto";
import type { UpdateVehicleCategoryData } from "../types/update";

const categoryInclude = {
  luggageCapacity: {
    include: { luggageType: true },
    orderBy: { luggageType: { name: "asc" as const } },
  },
} as const;

@Injectable()
export class CategoriesRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.vehicleCategory.findFirst({
      where: { id, deletedAt: null },
      include: categoryInclude,
    });
  }

  findMany(query: VehicleCategoryQueryDto) {
    const feature = new APIFeature(query, {
      initialFilter: { deletedAt: null },
      filterFields: ["isActive"],
      search: {
        searchFields: ["name", "description"],
      },
      sort: {
        allowedFields: ["createdAt", "updatedAt", "name", "passengerCount"],
        defaultSortBy: "name",
        defaultSortOrder: "asc",
      },
      pagination: {
        defaultLimit: 20,
        maxLimit: 100,
      },
    });

    return feature.execute({
      findMany: (args) =>
        this.prisma.vehicleCategory.findMany({
          where: args.where as never,
          orderBy: args.orderBy as never,
          skip: args.skip,
          take: args.take,
          include: categoryInclude,
        }),
      count: ({ where }) => this.prisma.vehicleCategory.count({ where: where as never }),
    });
  }

  findPublicCatalog(query: VehicleCategoryQueryDto) {
    const feature = new APIFeature(query, {
      initialFilter: { deletedAt: null, isActive: true },
      search: {
        searchFields: ["name", "description"],
      },
      sort: {
        allowedFields: ["createdAt", "updatedAt", "name", "passengerCount"],
        defaultSortBy: "name",
        defaultSortOrder: "asc",
      },
      pagination: {
        defaultLimit: 20,
        maxLimit: 100,
      },
    });

    return feature.execute({
      findMany: (args) =>
        this.prisma.vehicleCategory.findMany({
          where: args.where as never,
          orderBy: args.orderBy as never,
          skip: args.skip,
          take: args.take,
          include: categoryInclude,
        }),
      count: ({ where }) => this.prisma.vehicleCategory.count({ where: where as never }),
    });
  }

  findPublicActive() {
    return this.prisma.vehicleCategory.findMany({
      where: { deletedAt: null, isActive: true },
      orderBy: { name: "asc" },
      include: categoryInclude,
    });
  }

  create(data: CreateDto, luggageCapacity: VehicleCategoryLuggageCapacityInput[]) {
    return this.prisma.vehicleCategory.create({
      data: {
        name: data.name.trim(),
        description: data.description?.trim() ?? null,
        image: data.image?.trim() ?? null,
        passengerCount: data.passengerCount,
        luggageCapacity: {
          create: luggageCapacity.map((capacity) => ({
            luggageTypeId: capacity.luggageTypeId,
            quantity: capacity.quantity,
          })),
        },
      },
      include: categoryInclude,
    });
  }

  async update(
    id: string,
    data: UpdateDto,
    luggageCapacity?: VehicleCategoryLuggageCapacityInput[],
  ) {
    return this.prisma.$transaction(async (tx) => {
      if (luggageCapacity !== undefined) {
        await tx.vehicleCategoryLuggageCapacity.deleteMany({
          where: { categoryId: id },
        });
        await tx.vehicleCategoryLuggageCapacity.createMany({
          data: luggageCapacity.map((capacity) => ({
            categoryId: id,
            luggageTypeId: capacity.luggageTypeId,
            quantity: capacity.quantity,
          })),
        });
      }

      const updateData: UpdateVehicleCategoryData = {};

      if (data.name !== undefined) {
        updateData.name = data.name.trim();
      }
      if (data.description !== undefined) {
        updateData.description = data.description?.trim() ?? null;
      }
      if (data.image !== undefined) {
        updateData.image = data.image?.trim() ?? null;
      }
      if (data.passengerCount !== undefined) {
        updateData.passengerCount = data.passengerCount;
      }
      if (data.isActive !== undefined) {
        updateData.isActive = data.isActive;
      }

      return tx.vehicleCategory.update({
        where: { id },
        data: updateData,
        include: categoryInclude,
      });
    });
  }

  delete(id: string) {
    return this.prisma.vehicleCategory.delete({
      where: { id },
      include: categoryInclude,
    });
  }

  deleteMany(ids: string[]) {
    return this.prisma.vehicleCategory.deleteMany({
      where: { id: { in: ids } },
    });
  }

  countActiveByIds(ids: string[]) {
    return this.prisma.vehicleCategory.count({
      where: { id: { in: ids }, deletedAt: null },
    });
  }

  countBookingsByCategoryIds(ids: string[]) {
    return this.prisma.booking.count({
      where: { vehicleCategoryId: { in: ids } },
    });
  }
}
