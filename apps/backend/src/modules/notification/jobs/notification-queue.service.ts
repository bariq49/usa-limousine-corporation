import { Inject, Injectable, forwardRef } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Job, JobsOptions } from "bullmq";
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
  PUSH_MAX_ATTEMPTS,
  PUSH_RETRY_DELAY_MS,
  READ_RETENTION_DAYS,
  UNREAD_RETENTION_DAYS,
} from "../constants/notification.constants";
import { NotificationRepository } from "../repositories/notification.repository";
import { NotificationDeliveryService } from "../services/notification-delivery.service";
import { PushDeliveryService } from "../services/push-delivery.service";
import type { Push } from "../types/notification";

const DAY_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class NotificationQueueService extends BaseQueueService {
  constructor(
    @Inject(ConfigService) configService: ConfigService,
    @Inject(AppLogger) logger: AppLogger,
    @Inject(QueueRegistry) registry: QueueRegistry,
    @Inject(PushDeliveryService) private readonly pushDelivery: PushDeliveryService,
    @Inject(NotificationRepository) private readonly repository: NotificationRepository,
    @Inject(forwardRef(() => NotificationDeliveryService))
    private readonly delivery: NotificationDeliveryService,
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
    if (job.name === NOTIFICATION_JOB_NAMES.DELIVER_PUSH) {
      const payload = job.data as Push;
      const attempt = payload.attempt ?? 1;
      const result = await this.pushDelivery.deliver(payload);

      if (result.retryTokens.length > 0 && attempt < PUSH_MAX_ATTEMPTS) {
        await this.enqueuePush(
          {
            tokens: result.retryTokens,
            title: payload.title,
            body: payload.body,
            data: payload.data,
            attempt: attempt + 1,
          },
          PUSH_RETRY_DELAY_MS * attempt,
        );
      }
      return;
    }

    if (job.name === NOTIFICATION_JOB_NAMES.DELIVER_PENDING) {
      // Rows whose request/process died between insert and delivery (outbox recovery).
      const pending = await this.repository.findUndelivered(
        new Date(Date.now() - DELIVER_PENDING_AFTER_MS),
        DELIVER_PENDING_BATCH,
      );
      if (pending.length > 0) {
        this.logger.warn(
          `notification.redeliver count=${pending.length}`,
          NotificationQueueService.name,
        );
        await this.delivery.deliverMany({ notifications: pending });
      }
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

  /** One job per notification + attempt, so a re-delivery never queues the same push twice. */
  async enqueuePush(payload: Push, delay = 0) {
    if (!this.bullQueue.isReady()) {
      await this.pushDelivery.deliver(payload);
      return;
    }

    const notificationId = payload.data["notificationId"];
    const attempt = payload.attempt ?? 1;

    const options: JobsOptions = {
      delay,
      attempts: 3,
      removeOnComplete: true,
      removeOnFail: 200,
    };
    if (notificationId) {
      options.jobId = `push-${notificationId}-${attempt}`;
    }

    await this.addJob(NOTIFICATION_JOB_NAMES.DELIVER_PUSH, payload, options);
  }
}
