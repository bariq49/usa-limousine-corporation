import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { Request } from "express";
import { auditLog } from "../../../common/utils/audit-log";
import { toRequestContext } from "../../../common/utils/to-request-context";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import type {
  CommentQueryDto,
  CreateCommentDto,
  ReplyCommentDto,
  UpdateCommentDto,
} from "../dto/blog.dto";
import { BlogRepository } from "../repositories/blog.repository";
import { CommentRepository } from "../repositories/comment.repository";
import { sanitizeComment } from "../utils/content";
import { NotificationService } from "./notification.service";

@Injectable()
export class CommentService {
  constructor(
    @Inject(CommentRepository) private readonly comments: CommentRepository,
    @Inject(BlogRepository) private readonly blogs: BlogRepository,
    @Inject(NotificationService) private readonly notifications: NotificationService,
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  list(query: CommentQueryDto) {
    return this.comments.findMany(query);
  }

  async updateStatus(id: string, body: UpdateCommentDto, request: Request) {
    const context = toRequestContext(request);
    if (!(await this.comments.findById(id))) throw new NotFoundException("Comment not found");
    const comment = await this.comments.updateStatus(id, body.status);

    await auditLog({
      prisma: this.prisma,
      event: "blog.comment.updated",
      result: "success",
      context,
      userId: context.userId,
      metadata: { commentId: id, status: body.status },
    });
    return comment;
  }

  async reply(id: string, body: ReplyCommentDto, request: Request) {
    const context = toRequestContext(request);
    const existing = await this.comments.findById(id);
    if (!existing) throw new NotFoundException("Comment not found");

    const replyContent = sanitizeComment(body.content);
    if (replyContent.length < 2) {
      throw new BadRequestException("Reply must be at least 2 characters");
    }

    const comment = await this.comments.reply(id, replyContent);

    await auditLog({
      prisma: this.prisma,
      event: "blog.comment.replied",
      result: "success",
      context,
      userId: context.userId,
      metadata: { commentId: id },
    });

    void this.notifications.commentReplied({
      commentId: comment.id,
      blog: { title: comment.blog.title, slug: comment.blog.slug },
      comment: {
        fullName: comment.fullName,
        email: comment.email,
        content: comment.content,
      },
      reply: replyContent,
    });

    return comment;
  }

  async remove(id: string, request: Request) {
    const context = toRequestContext(request);
    if (!(await this.comments.findById(id))) throw new NotFoundException("Comment not found");
    await this.comments.delete(id);

    await auditLog({
      prisma: this.prisma,
      event: "blog.comment.deleted",
      result: "success",
      context,
      userId: context.userId,
      metadata: { commentId: id },
    });
    return { message: "Comment deleted", id };
  }

  async listApproved(slug: string, page: number, limit: number) {
    const blog = await this.blogs.findPublicId(slug);
    if (!blog) throw new NotFoundException("Article not found");
    const [data, total] = await this.comments.findApproved(blog.id, page, limit);
    return { data, total, page, limit, pages: Math.max(1, Math.ceil(total / limit)) };
  }

  async create(slug: string, body: CreateCommentDto) {
    const blog = await this.blogs.findPublicId(slug);
    if (!blog) throw new NotFoundException("Article not found");

    const content = sanitizeComment(body.content);
    if (content.length < 2) {
      throw new BadRequestException("Comment must be at least 2 characters");
    }

    const comment = await this.comments.create({
      blogId: blog.id,
      fullName: body.fullName,
      email: body.email,
      content,
    });

    void this.notifications.commentCreated({
      commentId: comment.id,
      blog,
      comment: { fullName: body.fullName, email: body.email, content },
    });
    return comment;
  }
}
