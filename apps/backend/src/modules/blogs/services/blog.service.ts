import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  type OnModuleDestroy,
  type OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { BlogStatus } from "@prisma/client";
import type { Request } from "express";
import { AppLogger } from "../../../common/logger/app.logger";
import { auditLog } from "../../../common/utils/audit-log";
import { toRequestContext } from "../../../common/utils/to-request-context";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import type {
  CreateDto,
  FeaturedQueryDto,
  PublicQueryDto,
  QueryDto,
  UpdateDto,
} from "../dto/blog.dto";
import { BlogRepository } from "../repositories/blog.repository";
import { CategoryRepository } from "../repositories/category.repository";
import { TagRepository } from "../repositories/tag.repository";
import type { UpdateData } from "../types/blog";
import { readingTime, sanitizeContent, uniqueSlug } from "../utils/content";
import { resolveSchedule, scheduleParts } from "../utils/schedule";

const PUBLISH_INTERVAL_MS = 60 * 1000;

@Injectable()
export class BlogService implements OnModuleInit, OnModuleDestroy {
  private publishTimer: NodeJS.Timeout | null = null;

  constructor(
    @Inject(BlogRepository) private readonly blogs: BlogRepository,
    @Inject(CategoryRepository) private readonly categories: CategoryRepository,
    @Inject(TagRepository) private readonly tags: TagRepository,
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(ConfigService) private readonly configService: ConfigService,
    @Inject(AppLogger) private readonly logger: AppLogger,
  ) {}

  onModuleInit() {
    if (this.configService.get<string>("NODE_ENV") === "test") return;
    this.publishTimer = setInterval(() => void this.publishDue(), PUBLISH_INTERVAL_MS);
  }

  onModuleDestroy() {
    if (this.publishTimer) clearInterval(this.publishTimer);
  }

  async publishDue() {
    try {
      const result = await this.blogs.publishDue(new Date());
      if (result.count > 0) {
        this.logger.log(`Published ${result.count} scheduled blog(s)`, BlogService.name);
      }
      return result.count;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      this.logger.error(
        `Scheduled blog publishing failed: ${message}`,
        undefined,
        BlogService.name,
      );
      return 0;
    }
  }

  list(query: QueryDto) {
    return this.blogs.findMany(query);
  }

  async getOne(id: string) {
    const blog = await this.blogs.findById(id);
    if (!blog) throw new NotFoundException("Blog not found");
    return blog;
  }

  async create(body: CreateDto, request: Request) {
    const context = toRequestContext(request);
    const category = await this.categories.findById(body.categoryId);
    if (!category) throw new BadRequestException("Blog category not found");
    if (!category.isActive) throw new BadRequestException("Blog category is not active");

    const tagIds = Array.from(new Set(body.tagIds ?? []));
    if (tagIds.length && (await this.tags.countActive(tagIds)) !== tagIds.length) {
      throw new BadRequestException("One or more tags were not found or are inactive");
    }

    const content = sanitizeContent(body.content);
    const schedule = resolveSchedule({
      status: body.status ?? BlogStatus.DRAFT,
      scheduledDate: body.scheduledDate,
      scheduledTime: body.scheduledTime,
      publishedAt: null,
    });
    const slug = await uniqueSlug(
      (value) => this.blogs.slugTaken(value).then(Boolean),
      body.slug,
      body.title,
    );

    const blog = await this.blogs.create(
      {
        title: body.title,
        slug,
        excerpt: body.excerpt || null,
        content,
        coverImage: body.coverImage || null,
        categoryId: body.categoryId,
        status: schedule.status,
        scheduledAt: schedule.scheduledAt,
        publishedAt: schedule.publishedAt,
        isFeatured: body.isFeatured ?? false,
        seoTitle: body.seoTitle || null,
        seoDescription: body.seoDescription || null,
        seoKeywords: body.seoKeywords || null,
        canonicalUrl: body.canonicalUrl || null,
        ogTitle: body.ogTitle || null,
        ogDescription: body.ogDescription || null,
        ogImage: body.ogImage || null,
        robots: body.robots || null,
        jsonLd: body.jsonLd || null,
        sortOrder: body.sortOrder ?? 0,
        readingTimeMinutes: readingTime(content),
      },
      tagIds,
    );

    await auditLog({
      prisma: this.prisma,
      event: "blog.created",
      result: "success",
      context,
      userId: context.userId,
      metadata: { blogId: blog.id, title: blog.title, status: blog.status },
    });
    return blog;
  }

  async update(id: string, body: UpdateDto, request: Request) {
    const context = toRequestContext(request);
    const existing = await this.getOne(id);

    if (body.categoryId !== undefined) {
      const category = await this.categories.findById(body.categoryId);
      if (!category) throw new BadRequestException("Blog category not found");
      if (!category.isActive) throw new BadRequestException("Blog category is not active");
    }

    const tagIds = body.tagIds ? Array.from(new Set(body.tagIds)) : undefined;
    if (tagIds && tagIds.length && (await this.tags.countActive(tagIds)) !== tagIds.length) {
      throw new BadRequestException("One or more tags were not found or are inactive");
    }

    const data: UpdateData = {};
    if (body.title !== undefined) data.title = body.title;
    if (body.slug !== undefined && body.slug !== existing.slug) {
      data.slug = await uniqueSlug(
        (value) => this.blogs.slugTaken(value, id).then(Boolean),
        body.slug,
        body.title ?? existing.title,
      );
    }
    if (body.excerpt !== undefined) data.excerpt = body.excerpt || null;
    if (body.content !== undefined) {
      const content = sanitizeContent(body.content);
      data.content = content;
      data.readingTimeMinutes = readingTime(content);
    }
    if (body.coverImage !== undefined) data.coverImage = body.coverImage || null;
    if (body.categoryId !== undefined) data.categoryId = body.categoryId;
    if (body.isFeatured !== undefined) data.isFeatured = body.isFeatured;
    if (body.seoTitle !== undefined) data.seoTitle = body.seoTitle || null;
    if (body.seoDescription !== undefined) data.seoDescription = body.seoDescription || null;
    if (body.seoKeywords !== undefined) data.seoKeywords = body.seoKeywords || null;
    if (body.canonicalUrl !== undefined) data.canonicalUrl = body.canonicalUrl || null;
    if (body.ogTitle !== undefined) data.ogTitle = body.ogTitle || null;
    if (body.ogDescription !== undefined) data.ogDescription = body.ogDescription || null;
    if (body.ogImage !== undefined) data.ogImage = body.ogImage || null;
    if (body.robots !== undefined) data.robots = body.robots || null;
    if (body.jsonLd !== undefined) data.jsonLd = body.jsonLd || null;
    if (body.sortOrder !== undefined) data.sortOrder = body.sortOrder;
    if (
      body.status !== undefined ||
      body.scheduledDate !== undefined ||
      body.scheduledTime !== undefined
    ) {
      const existingParts = scheduleParts(existing.scheduledAt);
      const schedule = resolveSchedule({
        status: body.status ?? existing.status,
        scheduledDate: body.scheduledDate ?? existingParts.scheduledDate,
        scheduledTime: body.scheduledTime ?? existingParts.scheduledTime,
        publishedAt: existing.publishedAt,
      });
      data.status = schedule.status;
      data.scheduledAt = schedule.scheduledAt;
      data.publishedAt = schedule.publishedAt;
    }

    const blog = await this.blogs.update(id, data, tagIds);

    await auditLog({
      prisma: this.prisma,
      event: "blog.updated",
      result: "success",
      context,
      userId: context.userId,
      metadata: { blogId: blog.id, title: blog.title, status: blog.status },
    });
    return blog;
  }

  async remove(id: string, request: Request) {
    const context = toRequestContext(request);
    const blog = await this.getOne(id);
    await this.blogs.delete(id);

    await auditLog({
      prisma: this.prisma,
      event: "blog.deleted",
      result: "success",
      context,
      userId: context.userId,
      metadata: { blogId: id, title: blog.title },
    });
    return { message: "Blog deleted", id };
  }

  listPublic(query: PublicQueryDto) {
    return this.blogs.findPublic(query);
  }

  featured(query: FeaturedQueryDto) {
    return this.blogs.findFeatured(query.limit);
  }

  sitemap() {
    return this.blogs.findSitemap();
  }

  async getPublic(slug: string) {
    const blog = await this.blogs.findPublicBySlug(slug);
    if (!blog) throw new NotFoundException("Article not found");
    return blog;
  }

  async recordView(slug: string) {
    const blog = await this.blogs.findPublicId(slug);
    if (!blog) throw new NotFoundException("Article not found");
    return this.blogs.incrementViews(blog.id);
  }
}
