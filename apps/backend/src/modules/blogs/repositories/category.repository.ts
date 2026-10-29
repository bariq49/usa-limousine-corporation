import { Inject, Injectable } from "@nestjs/common";
import { BlogStatus } from "@prisma/client";
import { APIFeature } from "../../../common/api-feature";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import type { TaxonomyQueryDto } from "../dto/blog.dto";
import type { CategoryCreate, CategoryUpdate } from "../types/taxonomy";

@Injectable()
export class CategoryRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.blogCategory.findUnique({
      where: { id },
      include: { _count: { select: { blogs: true } } },
    });
  }

  slugTaken(slug: string, exceptId?: string) {
    return this.prisma.blogCategory.count({
      where: exceptId ? { slug, id: { not: exceptId } } : { slug },
    });
  }

  findMany(query: TaxonomyQueryDto) {
    const feature = new APIFeature(query, {
      filterFields: ["isActive"],
      search: { searchFields: ["name", "slug", "description"] },
      sort: {
        allowedFields: ["createdAt", "name", "sortOrder"],
        defaultSortBy: "sortOrder",
        defaultSortOrder: "asc",
      },
      pagination: { defaultLimit: 20, maxLimit: 100 },
    });

    return feature.execute({
      findMany: (args) =>
        this.prisma.blogCategory.findMany({
          where: args.where,
          orderBy: args.orderBy,
          skip: args.skip,
          take: args.take,
          include: { _count: { select: { blogs: true } } },
        }),
      count: ({ where }) => this.prisma.blogCategory.count({ where }),
    });
  }

  findPublic() {
    const now = new Date();
    return this.prisma.blogCategory.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        _count: {
          select: {
            blogs: {
              where: {
                status: { in: [BlogStatus.PUBLISHED, BlogStatus.SCHEDULED] },
                publishedAt: { lte: now },
              },
            },
          },
        },
      },
    });
  }

  create(data: CategoryCreate) {
    return this.prisma.blogCategory.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        image: data.image,
        sortOrder: data.sortOrder,
        isActive: data.isActive,
      },
    });
  }

  update(id: string, data: CategoryUpdate) {
    return this.prisma.blogCategory.update({
      where: { id },
      data,
    });
  }

  delete(id: string) {
    return this.prisma.blogCategory.delete({ where: { id } });
  }
}
