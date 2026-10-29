import { Inject, Injectable } from "@nestjs/common";
import { BlogCommentStatus, BlogStatus } from "@prisma/client";
import { APIFeature } from "../../../common/api-feature";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import type { PublicQueryDto, QueryDto } from "../dto/blog.dto";
import type { CreateData, UpdateData } from "../types/blog";

@Injectable()
export class BlogRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.blog.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        tags: { select: { tag: { select: { id: true, name: true, slug: true } } } },
      },
    });
  }

  slugTaken(slug: string, exceptId?: string) {
    return this.prisma.blog.count({
      where: exceptId ? { slug, id: { not: exceptId } } : { slug },
    });
  }

  findMany(query: QueryDto) {
    const feature = new APIFeature(query, {
      filterFields: ["status", "categoryId", "isFeatured"],
      search: { searchFields: ["title", "slug", "excerpt"] },
      sort: {
        allowedFields: [
          "createdAt",
          "updatedAt",
          "publishedAt",
          "scheduledAt",
          "title",
          "viewCount",
        ],
        defaultSortBy: "createdAt",
        defaultSortOrder: "desc",
      },
      pagination: { defaultLimit: 20, maxLimit: 100 },
    });

    return feature.execute({
      findMany: (args) =>
        this.prisma.blog.findMany({
          where: args.where,
          orderBy: args.orderBy,
          skip: args.skip,
          take: args.take,
          omit: { content: true },
          include: {
            category: { select: { id: true, name: true, slug: true } },
            _count: { select: { comments: true } },
          },
        }),
      count: ({ where }) => this.prisma.blog.count({ where }),
    });
  }

  create(data: CreateData, tagIds: string[]) {
    return this.prisma.blog.create({
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        coverImage: data.coverImage,
        categoryId: data.categoryId,
        status: data.status,
        scheduledAt: data.scheduledAt,
        publishedAt: data.publishedAt,
        isFeatured: data.isFeatured,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        seoKeywords: data.seoKeywords,
        canonicalUrl: data.canonicalUrl,
        ogTitle: data.ogTitle,
        ogDescription: data.ogDescription,
        ogImage: data.ogImage,
        robots: data.robots,
        jsonLd: data.jsonLd,
        sortOrder: data.sortOrder,
        readingTimeMinutes: data.readingTimeMinutes,
        tags: { create: tagIds.map((tagId) => ({ tagId })) },
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        tags: { select: { tag: { select: { id: true, name: true, slug: true } } } },
      },
    });
  }

  update(id: string, data: UpdateData, tagIds?: string[]) {
    return this.prisma.$transaction(async (tx) => {
      if (tagIds) {
        await tx.blogPostTag.deleteMany({ where: { blogId: id } });
        await tx.blogPostTag.createMany({ data: tagIds.map((tagId) => ({ blogId: id, tagId })) });
      }
      return tx.blog.update({
        where: { id },
        data,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          tags: { select: { tag: { select: { id: true, name: true, slug: true } } } },
        },
      });
    });
  }

  delete(id: string) {
    return this.prisma.blog.delete({ where: { id } });
  }

  publishDue(now: Date) {
    return this.prisma.blog.updateMany({
      where: { status: BlogStatus.SCHEDULED, publishedAt: { lte: now } },
      data: { status: BlogStatus.PUBLISHED, scheduledAt: null },
    });
  }

  findPublic(query: PublicQueryDto) {
    const now = new Date();
    const feature = new APIFeature(query, {
      initialFilter: {
        status: { in: [BlogStatus.PUBLISHED, BlogStatus.SCHEDULED] },
        publishedAt: { lte: now },
        category: query.category
          ? { isActive: true, slug: query.category }
          : { isActive: true },
        tags: query.tag
          ? { some: { tag: { slug: query.tag, isActive: true } } }
          : undefined,
      },
      filterFields: [],
      excludeQueryKeys: ["category", "tag"],
      search: { searchFields: ["title", "excerpt"] },
      sort: {
        allowedFields: ["publishedAt", "viewCount"],
        defaultSortBy: "publishedAt",
        defaultSortOrder: "desc",
      },
      pagination: { defaultLimit: 9, maxLimit: 50 },
    });

    return feature.execute({
      findMany: (args) =>
        this.prisma.blog.findMany({
          where: args.where,
          orderBy: args.orderBy,
          skip: args.skip,
          take: args.take,
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            coverImage: true,
            isFeatured: true,
            publishedAt: true,
            readingTimeMinutes: true,
            viewCount: true,
            category: { select: { id: true, name: true, slug: true } },
            tags: { select: { tag: { select: { id: true, name: true, slug: true } } } },
            _count: { select: { comments: { where: { status: BlogCommentStatus.APPROVED } } } },
          },
        }),
      count: ({ where }) => this.prisma.blog.count({ where }),
    });
  }

  findFeatured(limit: number) {
    const now = new Date();
    return this.prisma.blog.findMany({
      where: {
        status: { in: [BlogStatus.PUBLISHED, BlogStatus.SCHEDULED] },
        publishedAt: { lte: now },
        category: { isActive: true },
        isFeatured: true,
      },
      orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }],
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        isFeatured: true,
        publishedAt: true,
        readingTimeMinutes: true,
        viewCount: true,
        category: { select: { id: true, name: true, slug: true } },
        tags: { select: { tag: { select: { id: true, name: true, slug: true } } } },
        _count: { select: { comments: { where: { status: BlogCommentStatus.APPROVED } } } },
      },
    });
  }

  findPublicBySlug(slug: string) {
    const now = new Date();
    return this.prisma.blog.findFirst({
      where: {
        slug,
        status: { in: [BlogStatus.PUBLISHED, BlogStatus.SCHEDULED] },
        publishedAt: { lte: now },
        category: { isActive: true },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        content: true,
        coverImage: true,
        isFeatured: true,
        publishedAt: true,
        readingTimeMinutes: true,
        viewCount: true,
        seoTitle: true,
        seoDescription: true,
        seoKeywords: true,
        canonicalUrl: true,
        ogTitle: true,
        ogDescription: true,
        ogImage: true,
        robots: true,
        jsonLd: true,
        updatedAt: true,
        category: { select: { id: true, name: true, slug: true } },
        tags: { select: { tag: { select: { id: true, name: true, slug: true } } } },
        _count: { select: { comments: { where: { status: BlogCommentStatus.APPROVED } } } },
      },
    });
  }

  findPublicId(slug: string) {
    const now = new Date();
    return this.prisma.blog.findFirst({
      where: {
        slug,
        status: { in: [BlogStatus.PUBLISHED, BlogStatus.SCHEDULED] },
        publishedAt: { lte: now },
        category: { isActive: true },
      },
      select: { id: true, title: true, slug: true },
    });
  }

  incrementViews(id: string) {
    return this.prisma.blog.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
      select: { viewCount: true },
    });
  }

  findSitemap() {
    const now = new Date();
    return this.prisma.blog.findMany({
      where: {
        status: { in: [BlogStatus.PUBLISHED, BlogStatus.SCHEDULED] },
        publishedAt: { lte: now },
        category: { isActive: true },
      },
      orderBy: { publishedAt: "desc" },
      take: 5000,
      select: { slug: true, updatedAt: true },
    });
  }
}
