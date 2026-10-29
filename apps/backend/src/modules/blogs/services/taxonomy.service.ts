import { ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { Request } from "express";
import { auditLog } from "../../../common/utils/audit-log";
import { toRequestContext } from "../../../common/utils/to-request-context";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import type { CreateTaxonomyDto, TaxonomyQueryDto, UpdateTaxonomyDto } from "../dto/blog.dto";
import { CategoryRepository } from "../repositories/category.repository";
import { TagRepository } from "../repositories/tag.repository";
import type { CategoryUpdate, TagUpdate } from "../types/taxonomy";
import { slugify } from "../utils/content";

@Injectable()
export class TaxonomyService {
  constructor(
    @Inject(CategoryRepository) private readonly categories: CategoryRepository,
    @Inject(TagRepository) private readonly tags: TagRepository,
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  listCategories(query: TaxonomyQueryDto) {
    return this.categories.findMany(query);
  }

  publicCategories() {
    return this.categories.findPublic();
  }

  async getCategory(id: string) {
    const category = await this.categories.findById(id);
    if (!category) throw new NotFoundException("Blog category not found");
    return category;
  }

  async createCategory(body: CreateTaxonomyDto, request: Request) {
    const context = toRequestContext(request);
    const slug = body.slug || slugify(body.name);
    if (await this.categories.slugTaken(slug)) {
      throw new ConflictException("A category with this slug already exists");
    }
    const category = await this.categories.create({
      name: body.name,
      slug,
      description: body.description || null,
      image: body.image || null,
      sortOrder: body.sortOrder ?? 0,
      isActive: body.isActive ?? true,
    });

    await auditLog({
      prisma: this.prisma,
      event: "blog.category.created",
      result: "success",
      context,
      userId: context.userId,
      metadata: { categoryId: category.id, slug: category.slug },
    });
    return category;
  }

  async updateCategory(id: string, body: UpdateTaxonomyDto, request: Request) {
    const context = toRequestContext(request);
    await this.getCategory(id);
    if (body.slug && (await this.categories.slugTaken(body.slug, id))) {
      throw new ConflictException("A category with this slug already exists");
    }
    const data: CategoryUpdate = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.slug !== undefined) data.slug = body.slug;
    if (body.description !== undefined) data.description = body.description || null;
    if (body.image !== undefined) data.image = body.image || null;
    if (body.sortOrder !== undefined) data.sortOrder = body.sortOrder;
    if (body.isActive !== undefined) data.isActive = body.isActive;
    const category = await this.categories.update(id, data);

    await auditLog({
      prisma: this.prisma,
      event: "blog.category.updated",
      result: "success",
      context,
      userId: context.userId,
      metadata: { categoryId: id, slug: category.slug },
    });
    return category;
  }

  async removeCategory(id: string, request: Request) {
    const context = toRequestContext(request);
    const category = await this.getCategory(id);
    if (category._count.blogs > 0) {
      throw new ConflictException("Move or delete this category's articles before deleting it");
    }
    await this.categories.delete(id);

    await auditLog({
      prisma: this.prisma,
      event: "blog.category.deleted",
      result: "success",
      context,
      userId: context.userId,
      metadata: { categoryId: id, slug: category.slug },
    });
    return { message: "Blog category deleted", id };
  }

  listTags(query: TaxonomyQueryDto) {
    return this.tags.findMany(query);
  }

  publicTags() {
    return this.tags.findPublic();
  }

  async getTag(id: string) {
    const tag = await this.tags.findById(id);
    if (!tag) throw new NotFoundException("Blog tag not found");
    return tag;
  }

  async createTag(body: CreateTaxonomyDto, request: Request) {
    const context = toRequestContext(request);
    const slug = body.slug || slugify(body.name);
    if (await this.tags.slugTaken(slug)) {
      throw new ConflictException("A tag with this slug already exists");
    }
    const tag = await this.tags.create({
      name: body.name,
      slug,
      sortOrder: body.sortOrder ?? 0,
      isActive: body.isActive ?? true,
    });

    await auditLog({
      prisma: this.prisma,
      event: "blog.tag.created",
      result: "success",
      context,
      userId: context.userId,
      metadata: { tagId: tag.id, slug: tag.slug },
    });
    return tag;
  }

  async updateTag(id: string, body: UpdateTaxonomyDto, request: Request) {
    const context = toRequestContext(request);
    await this.getTag(id);
    if (body.slug && (await this.tags.slugTaken(body.slug, id))) {
      throw new ConflictException("A tag with this slug already exists");
    }
    const data: TagUpdate = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.slug !== undefined) data.slug = body.slug;
    if (body.sortOrder !== undefined) data.sortOrder = body.sortOrder;
    if (body.isActive !== undefined) data.isActive = body.isActive;
    const tag = await this.tags.update(id, data);

    await auditLog({
      prisma: this.prisma,
      event: "blog.tag.updated",
      result: "success",
      context,
      userId: context.userId,
      metadata: { tagId: id, slug: tag.slug },
    });
    return tag;
  }

  async removeTag(id: string, request: Request) {
    const context = toRequestContext(request);
    const tag = await this.getTag(id);
    if (tag._count.blogs > 0) {
      throw new ConflictException("Remove this tag from articles before deleting it");
    }
    await this.tags.delete(id);

    await auditLog({
      prisma: this.prisma,
      event: "blog.tag.deleted",
      result: "success",
      context,
      userId: context.userId,
      metadata: { tagId: id, slug: tag.slug },
    });
    return { message: "Blog tag deleted", id };
  }
}
