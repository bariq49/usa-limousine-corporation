import { Inject, Injectable } from "@nestjs/common";
import { APIFeature } from "../../../common/api-feature";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import type { QueryDto } from "../dto/query.dto";

const vehicleInclude = {
  driver: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      user: { select: { id: true, email: true } },
    },
  },
  vehicleCategory: true,
} as const;

@Injectable()
export class VehicleRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.driverVehicle.findFirst({
      where: { id, deletedAt: null },
      include: vehicleInclude,
    });
  }

  findMany(query: QueryDto) {
    const feature = new APIFeature(query, {
      initialFilter: { deletedAt: null },
      filterFields: ["vehicleCategoryId", "make"],
      search: {
        searchFields: ["make", "model", "licensePlate", "color"],
      },
      sort: {
        allowedFields: ["createdAt", "updatedAt", "make", "model", "year", "licensePlate"],
        defaultSortBy: "createdAt",
        defaultSortOrder: "desc",
      },
      pagination: {
        defaultLimit: 20,
        maxLimit: 100,
      },
    });

    return feature.execute({
      findMany: (args) =>
        this.prisma.driverVehicle.findMany({
          where: args.where as never,
          orderBy: args.orderBy as never,
          skip: args.skip,
          take: args.take,
          include: vehicleInclude,
        }),
      count: ({ where }) => this.prisma.driverVehicle.count({ where: where as never }),
    });
  }

  remove(id: string) {
    return this.prisma.driverVehicle.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  bulkRemove(ids: string[]) {
    return this.prisma.driverVehicle.updateMany({
      where: { id: { in: ids }, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  }
}
