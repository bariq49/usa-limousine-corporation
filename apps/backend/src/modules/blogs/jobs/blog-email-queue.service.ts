import { Inject, Injectable, forwardRef } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Job } from "bullmq";
import { AppLogger } from "../../../common/logger/app.logger";
import { BaseQueueService } from "../../../infrastructure/queue/base-queue.service";
import { QueueRegistry } from "../../../infrastructure/queue/queue-registry";
import { BLOG_JOB_NAMES, BLOG_QUEUE_NAME } from "../constants/blog.constants";
import { NotificationService } from "../services/notification.service";
import type { CommentCreated, CommentReplied } from "../types/notification";

@Injectable()
export class BlogEmailQueueService extends BaseQueueService {
  constructor(
    @Inject(ConfigService) configService: ConfigService,
    @Inject(AppLogger) logger: AppLogger,
    @Inject(QueueRegistry) registry: QueueRegistry,
    @Inject(forwardRef(() => NotificationService))
    private readonly notifications: NotificationService,
  ) {
    super(configService, logger, registry);
  }

  protected getQueueName() {
    return BLOG_QUEUE_NAME;
  }

  protected getQueueLabel() {
    return "Blog email queue";
  }

  protected async processJob(job: Job) {
    if (job.name === BLOG_JOB_NAMES.SEND_COMMENT_ADMIN_EMAIL) {
      await this.notifications.deliverCommentAdminEmail(job.data as CommentCreated);
      return;
    }
    if (job.name === BLOG_JOB_NAMES.SEND_COMMENT_REPLY_EMAIL) {
      await this.notifications.deliverCommentReplyEmail(job.data as CommentReplied);
    }
  }

  enqueueCommentAdminEmail(payload: CommentCreated) {
    return this.addJob(BLOG_JOB_NAMES.SEND_COMMENT_ADMIN_EMAIL, payload);
  }

  enqueueCommentReplyEmail(payload: CommentReplied) {
    return this.addJob(BLOG_JOB_NAMES.SEND_COMMENT_REPLY_EMAIL, payload);
  }
}
