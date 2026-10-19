import { Inject, Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { APIFeature } from "../../../common/api-feature";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import type { CreateDto } from "../dto/create.dto";
import type { QueryDto } from "../dto/query.dto";
import type { UpdateDto } from "../dto/update.dto";

@Injectable()
export class ExtraServiceRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.extraService.findFirst({
      where: { id, deletedAt: null },
    });
  }

  countByIds(ids: string[]) {
    return this.prisma.extraService.count({
      where: { id: { in: ids }, deletedAt: null },
    });
  }

  findMany(query: QueryDto) {
    const feature = new APIFeature(query, {
      initialFilter: { deletedAt: null },
      filterFields: ["type", "isActive"],
      search: {
        searchFields: ["name", "description"],
      },
      sort: {
        allowedFields: ["createdAt", "updatedAt", "name", "price", "sortOrder"],
        defaultSortBy: "sortOrder",
        defaultSortOrder: "asc",
      },
      pagination: {
        defaultLimit: 50,
        maxLimit: 100,
      },
    });

    return feature.execute({
      findMany: (args) =>
        this.prisma.extraService.findMany({
          where: args.where as Prisma.ExtraServiceWhereInput,
          orderBy: args.orderBy as Prisma.ExtraServiceOrderByWithRelationInput,
          skip: args.skip,
          take: args.take,
        }),
      count: ({ where }) =>
        this.prisma.extraService.count({ where: where as Prisma.ExtraServiceWhereInput }),
    });
  }

  findActive() {
    return this.prisma.extraService.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: { sortOrder: "asc" },
    });
  }

  create(data: CreateDto) {
    return this.prisma.extraService.create({
      data: {
        name: data.name.trim(),
        image: data.image?.trim() ?? null,
        description: data.description?.trim() ?? null,
        price: data.price,
        type: data.type ?? "EXTRA",
        maxQuantity: data.maxQuantity ?? 1,
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder ?? 0,
      },
    });
  }

  update(id: string, data: UpdateDto) {
    const updateData: Prisma.ExtraServiceUpdateInput = {};

    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.image !== undefined) updateData.image = data.image ? data.image.trim() : null;
    if (data.description !== undefined)
      updateData.description = data.description ? data.description.trim() : null;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.maxQuantity !== undefined) updateData.maxQuantity = data.maxQuantity;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;

    return this.prisma.extraService.update({
      where: { id },
      data: updateData,
    });
  }

  delete(id: string) {
    return this.prisma.extraService.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  deleteMany(ids: string[]) {
    return this.prisma.extraService.updateMany({
      where: { id: { in: ids }, deletedAt: null },
      data: { deletedAt: new Date(), isActive: false },
    });
  }
}
