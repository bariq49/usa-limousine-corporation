import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Job } from "bullmq";
import { AppLogger } from "../../../common/logger/app.logger";
import { BaseQueueService } from "../../../infrastructure/queue/base-queue.service";
import { QueueRegistry } from "../../../infrastructure/queue/queue-registry";
import {
  CLEANUP_EVERY_MS,
  DELIVER_PENDING_AFTER_MS,
  DELIVER_PENDING_BATCH,
  DELIVER_PENDING_EVERY_MS,
  NOTIFICATION_JOB_NAMES,
  NOTIFICATION_QUEUE_NAME,
  READ_RETENTION_DAYS,
  UNREAD_RETENTION_DAYS,
} from "../constants/constants";
import { NotificationRepository } from "../repositories/notification.repository";
import { NotificationService } from "../services/notification.service";

const DAY_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class NotificationQueueService extends BaseQueueService {
  constructor(
    @Inject(ConfigService) configService: ConfigService,
    @Inject(AppLogger) logger: AppLogger,
    @Inject(QueueRegistry) registry: QueueRegistry,
    @Inject(NotificationRepository) private readonly repository: NotificationRepository,
    @Inject(NotificationService) private readonly notifications: NotificationService,
  ) {
    super(configService, logger, registry);
  }

  protected getQueueName() {
    return NOTIFICATION_QUEUE_NAME;
  }

  protected getQueueLabel() {
    return "Notification queue";
  }

  protected override async afterQueueStart() {
    if (!this.bullQueue.isReady()) {
      return;
    }

    await this.scheduleJobs([
      { name: NOTIFICATION_JOB_NAMES.DELIVER_PENDING, everyMs: DELIVER_PENDING_EVERY_MS },
      { name: NOTIFICATION_JOB_NAMES.CLEANUP, everyMs: CLEANUP_EVERY_MS },
    ]);
  }

  protected async processJob(job: Job) {
    if (job.name === NOTIFICATION_JOB_NAMES.DELIVER_PENDING) {
      const result = await this.notifications.deliverPending(
        new Date(Date.now() - DELIVER_PENDING_AFTER_MS),
        DELIVER_PENDING_BATCH,
      );
      const status = await this.notifications.getDeliveryStatus();
      this.logger.log(
        `notification.delivery claimed=${result.claimed} delivered=${result.delivered} failed=${result.failed} deadLettered=${result.deadLettered} pending=${status.pending} retryScheduled=${status.retryScheduled} inProgress=${status.inProgress} totalDeadLettered=${status.deadLettered}`,
        NotificationQueueService.name,
      );
      return;
    }

    if (job.name === NOTIFICATION_JOB_NAMES.CLEANUP) {
      const now = Date.now();
      const result = await this.repository.deleteExpired(
        new Date(now - READ_RETENTION_DAYS * DAY_MS),
        new Date(now - UNREAD_RETENTION_DAYS * DAY_MS),
      );
      this.logger.log(
        `notification.cleanup deleted=${result.count}`,
        NotificationQueueService.name,
      );
    }
  }
}
