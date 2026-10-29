import { Inject, Injectable } from "@nestjs/common";
import { BlogCommentStatus } from "@prisma/client";
import { APIFeature } from "../../../common/api-feature";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import type { CommentQueryDto } from "../dto/blog.dto";
import type { CommentCreate } from "../types/comment";

@Injectable()
export class CommentRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.blogComment.findUnique({ where: { id } });
  }

  findMany(query: CommentQueryDto) {
    const feature = new APIFeature(query, {
      filterFields: ["status", "blogId"],
      search: { searchFields: ["fullName", "email", "content"] },
      sort: {
        allowedFields: ["createdAt", "status"],
        defaultSortBy: "createdAt",
        defaultSortOrder: "desc",
      },
      pagination: { defaultLimit: 20, maxLimit: 100 },
    });

    return feature.execute({
      findMany: (args) =>
        this.prisma.blogComment.findMany({
          where: args.where,
          orderBy: args.orderBy,
          skip: args.skip,
          take: args.take,
          include: { blog: { select: { id: true, title: true, slug: true } } },
        }),
      count: ({ where }) => this.prisma.blogComment.count({ where }),
    });
  }

  findApproved(blogId: string, page: number, limit: number) {
    const where = { blogId, status: BlogCommentStatus.APPROVED };
    return this.prisma.$transaction([
      this.prisma.blogComment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          fullName: true,
          content: true,
          replyContent: true,
          repliedAt: true,
          createdAt: true,
        },
      }),
      this.prisma.blogComment.count({ where }),
    ]);
  }

  create(data: CommentCreate) {
    return this.prisma.blogComment.create({
      data: {
        blogId: data.blogId,
        fullName: data.fullName,
        email: data.email,
        content: data.content,
      },
      select: { id: true, status: true, createdAt: true },
    });
  }

  updateStatus(id: string, status: BlogCommentStatus) {
    return this.prisma.blogComment.update({
      where: { id },
      data: { status, reviewedAt: new Date() },
      include: { blog: { select: { id: true, title: true, slug: true } } },
    });
  }

  reply(id: string, replyContent: string) {
    return this.prisma.blogComment.update({
      where: { id },
      data: {
        replyContent,
        repliedAt: new Date(),
        status: BlogCommentStatus.APPROVED,
        reviewedAt: new Date(),
      },
      include: { blog: { select: { id: true, title: true, slug: true } } },
    });
  }

  delete(id: string) {
    return this.prisma.blogComment.delete({ where: { id } });
  }
}
