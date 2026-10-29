import { Inject, Injectable } from "@nestjs/common";
import { APIFeature } from "../../../common/api-feature";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import type { CreateDto } from "../dto/create-luggage.dto";
import type { QueryDto } from "../dto/luggage-query.dto";
import type { UpdateLuggageDto } from "../dto/update-luggage.dto";

@Injectable()
export class LuggageRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.luggageType.findUnique({
      where: { id },
      include: {
        capacities: {
          where: {
            category: {
              deletedAt: null,
            },
          },
          select: {
            id: true,
            categoryId: true,
            quantity: true,
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  findByIds(ids: string[]) {
    return this.prisma.luggageType.findMany({
      where: { id: { in: ids }, isActive: true },
      select: { id: true },
    });
  }

  findMany(query: QueryDto) {
    const feature = new APIFeature(query, {
      filterFields: ["isActive"],
      search: {
        searchFields: ["name", "description", "dimensions"],
      },
      sort: {
        allowedFields: ["createdAt", "updatedAt", "name"],
        defaultSortBy: "name",
        defaultSortOrder: "asc",
      },
      pagination: {
        defaultLimit: 50,
        maxLimit: 100,
      },
    });

    return feature.execute({
      findMany: (args) =>
        this.prisma.luggageType.findMany({
          where: args.where as never,
          orderBy: args.orderBy as never,
          skip: args.skip,
          take: args.take,
          include: {
            capacities: {
              where: {
                category: {
                  deletedAt: null,
                },
              },
              select: {
                id: true,
                categoryId: true,
                quantity: true,
                category: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            _count: {
              select: {
                capacities: {
                  where: {
                    category: {
                      deletedAt: null,
                    },
                  },
                },
              },
            },
          },
        }),
      count: ({ where }) => this.prisma.luggageType.count({ where: where as never }),
    });
  }

  create(data: CreateDto) {
    return this.prisma.luggageType.create({
      data: {
        name: data.name.trim(),
        description: data.description?.trim() ?? null,
        dimensions: data.dimensions?.trim() ?? null,
        image: data.image?.trim() ?? null,
        price: data.price !== undefined ? data.price : null,
        isActive: data.isActive ?? true,
      },
    });
  }

  update(id: string, data: UpdateLuggageDto) {
    const updateData: {
      name?: string;
      description?: string | null;
      dimensions?: string | null;
      image?: string | null;
      price?: number | null;
      isActive?: boolean;
    } = {};

    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.description !== undefined) updateData.description = data.description?.trim() ?? null;
    if (data.dimensions !== undefined) updateData.dimensions = data.dimensions?.trim() ?? null;
    if (data.image !== undefined) updateData.image = data.image?.trim() ?? null;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    return this.prisma.luggageType.update({
      where: { id },
      data: updateData,
    });
  }

  delete(id: string) {
    return this.prisma.luggageType.delete({
      where: { id },
    });
  }

  deleteMany(ids: string[]) {
    return this.prisma.luggageType.deleteMany({
      where: { id: { in: ids } },
    });
  }

  countByIds(ids: string[]) {
    return this.prisma.luggageType.count({
      where: { id: { in: ids } },
    });
  }

  countCategoryUsages(ids: string[]) {
    return this.prisma.vehicleCategoryLuggageCapacity.count({
      where: { luggageTypeId: { in: ids } },
    });
  }
}
