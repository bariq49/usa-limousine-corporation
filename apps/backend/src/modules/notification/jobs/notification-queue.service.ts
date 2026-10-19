import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Job } from "bullmq";
import { AppLogger } from "../../../common/logger/app.logger";
import { BaseQueueService } from "../../../infrastructure/queue/base-queue.service";
import { QueueRegistry } from "../../../infrastructure/queue/queue-registry";
import {
  NOTIFICATION_JOB_NAMES,
  NOTIFICATION_QUEUE_NAME,
} from "../constants/notification.constants";
import { PushDeliveryService } from "../services/push-delivery.service";
import type { Push } from "../types/notification";

@Injectable()
export class NotificationQueueService extends BaseQueueService {
  constructor(
    @Inject(ConfigService) configService: ConfigService,
    @Inject(AppLogger) logger: AppLogger,
    @Inject(QueueRegistry) registry: QueueRegistry,
    @Inject(PushDeliveryService) private readonly pushDelivery: PushDeliveryService,
  ) {
    super(configService, logger, registry);
  }

  protected getQueueName() {
    return NOTIFICATION_QUEUE_NAME;
  }

  protected getQueueLabel() {
    return "Notification queue";
  }

  protected async processJob(job: Job) {
    if (job.name === NOTIFICATION_JOB_NAMES.DELIVER_PUSH) {
      await this.pushDelivery.deliver(job.data as Push);
    }
  }

  async enqueuePush(payload: Push) {
    if (!this.bullQueue.isReady()) {
      await this.pushDelivery.deliver(payload);
      return;
    }

    await this.addJob(NOTIFICATION_JOB_NAMES.DELIVER_PUSH, payload, {
      attempts: 3,
      removeOnComplete: true,
      removeOnFail: 200,
    });
  }
}
