import { Inject, Injectable, forwardRef } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NotificationType } from "@prisma/client";
import { PLATFORM } from "@usa-limousine-corporation/config";
import { AppLogger } from "../../../common/logger/app.logger";
import { stageForAdmins } from "../../../common/utils/notification";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { getEmailConfig } from "../../../infrastructure/email/email.config";
import { EmailService } from "../../../infrastructure/email/email.service";
import {
  blogCommentReplyUser,
  newBlogCommentAdmin,
} from "../../../infrastructure/email/templates/blog/comment";
import { NotificationService as AppNotificationService } from "../../notification/services/notification.service";
import { BlogEmailQueueService } from "../jobs/blog-email-queue.service";
import type { CommentCreated, CommentReplied } from "../types/notification";

@Injectable()
export class NotificationService {
  constructor(
    @Inject(EmailService) private readonly emailService: EmailService,
    @Inject(ConfigService) private readonly configService: ConfigService,
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(AppNotificationService) private readonly appNotifications: AppNotificationService,
    @Inject(forwardRef(() => BlogEmailQueueService))
    private readonly emailQueue: BlogEmailQueueService,
    @Inject(AppLogger) private readonly logger: AppLogger,
  ) {}

  async commentCreated(input: CommentCreated) {
    await this.notifyAdmins(input);
    await this.emailAdmins(input);
  }

  async notifyAdmins(input: CommentCreated) {
    try {
      const staged = await this.prisma.$transaction((tx) =>
        stageForAdmins(
          {
            notificationService: this.appNotifications,
            type: NotificationType.BLOG_COMMENT_CREATED,
            title: "New blog comment",
            body: `${input.comment.fullName} commented on "${input.blog.title}"`,
            data: {
              type: "BLOG_COMMENT_CREATED",
              commentId: input.commentId,
              blogSlug: input.blog.slug,
              blogTitle: input.blog.title,
            },
            idempotencyKey: `BLOG_COMMENT_CREATED:${input.commentId}`,
          },
          tx,
        ),
      );
      await this.appNotifications.deliverStaged(staged);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      this.logger.error(
        `Blog comment notification failed for ${input.blog.slug}: ${message}`,
        undefined,
        NotificationService.name,
      );
    }
  }

  async emailAdmins(input: CommentCreated) {
    if (!getEmailConfig(this.configService).defaultAdminEmail) return;

    try {
      await this.emailQueue.enqueueCommentAdminEmail(input);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      this.logger.error(
        `Blog comment email enqueue failed for ${input.blog.slug}: ${message}`,
        undefined,
        NotificationService.name,
      );
    }
  }

  async deliverCommentAdminEmail(input: CommentCreated) {
    const adminEmail = getEmailConfig(this.configService).defaultAdminEmail;
    if (!adminEmail) return;

    const siteUrl = this.configService.getOrThrow<string>("WEBSITE_URL").replace(/\/+$/, "");
    const adminUrl = this.configService.get<string>("ADMIN_APP_URL")?.replace(/\/+$/, "");

    await this.emailService.send({
      to: adminEmail,
      replyTo: input.comment.email,
      subject: `New comment on "${input.blog.title}" - ${PLATFORM.shortName}`,
      html: newBlogCommentAdmin({
        siteUrl,
        reviewUrl: adminUrl ? `${adminUrl}/blog-comments` : null,
        article: { title: input.blog.title, url: `${siteUrl}/blog/${input.blog.slug}` },
        comment: input.comment,
      }),
    });
  }

  async commentReplied(input: CommentReplied) {
    try {
      await this.emailQueue.enqueueCommentReplyEmail(input);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      this.logger.error(
        `Blog comment reply email enqueue failed for ${input.blog.slug}: ${message}`,
        undefined,
        NotificationService.name,
      );
    }
  }

  async deliverCommentReplyEmail(input: CommentReplied) {
    const siteUrl = this.configService.getOrThrow<string>("WEBSITE_URL").replace(/\/+$/, "");

    await this.emailService.send({
      to: input.comment.email,
      subject: `Reply to your comment on "${input.blog.title}" - ${PLATFORM.shortName}`,
      html: blogCommentReplyUser({
        siteUrl,
        article: { title: input.blog.title, url: `${siteUrl}/blog/${input.blog.slug}` },
        comment: { fullName: input.comment.fullName, content: input.comment.content },
        reply: input.reply,
      }),
    });
  }
}
