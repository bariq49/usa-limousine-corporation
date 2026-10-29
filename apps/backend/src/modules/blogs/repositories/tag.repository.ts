import { Inject, Injectable } from "@nestjs/common";
import { APIFeature } from "../../../common/api-feature";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import type { TaxonomyQueryDto } from "../dto/blog.dto";
import type { TagCreate, TagUpdate } from "../types/taxonomy";

@Injectable()
export class TagRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.blogTag.findUnique({
      where: { id },
      include: { _count: { select: { blogs: true } } },
    });
  }

  slugTaken(slug: string, exceptId?: string) {
    return this.prisma.blogTag.count({
      where: exceptId ? { slug, id: { not: exceptId } } : { slug },
    });
  }

  countActive(ids: string[]) {
    return this.prisma.blogTag.count({ where: { id: { in: ids }, isActive: true } });
  }

  findMany(query: TaxonomyQueryDto) {
    const feature = new APIFeature(query, {
      filterFields: ["isActive"],
      search: { searchFields: ["name", "slug"] },
      sort: {
        allowedFields: ["createdAt", "name", "sortOrder"],
        defaultSortBy: "sortOrder",
        defaultSortOrder: "asc",
      },
      pagination: { defaultLimit: 20, maxLimit: 100 },
    });

    return feature.execute({
      findMany: (args) =>
        this.prisma.blogTag.findMany({
          where: args.where,
          orderBy: args.orderBy,
          skip: args.skip,
          take: args.take,
          include: { _count: { select: { blogs: true } } },
        }),
      count: ({ where }) => this.prisma.blogTag.count({ where }),
    });
  }

  findPublic() {
    return this.prisma.blogTag.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true, slug: true },
    });
  }

  create(data: TagCreate) {
    return this.prisma.blogTag.create({
      data: {
        name: data.name,
        slug: data.slug,
        sortOrder: data.sortOrder,
        isActive: data.isActive,
      },
    });
  }

  update(id: string, data: TagUpdate) {
    return this.prisma.blogTag.update({
      where: { id },
      data,
    });
  }

  delete(id: string) {
    return this.prisma.blogTag.delete({ where: { id } });
  }
}
