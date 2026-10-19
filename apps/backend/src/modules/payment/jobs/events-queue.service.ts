import { Inject, Injectable, forwardRef } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Job } from "bullmq";
import { AppLogger } from "../../../common/logger/app.logger";
import { BaseQueueService } from "../../../infrastructure/queue/base-queue.service";
import { QueueRegistry } from "../../../infrastructure/queue/queue-registry";
import {
  PAYMENT_JOB_NAMES,
  PAYMENT_OUTBOX_DRAIN_INTERVAL_MS,
  PAYMENT_QUEUE_NAME,
} from "../constants/payment.constants";
import { OutboxService } from "../services/outbox.service";

@Injectable()
export class EventsQueueService extends BaseQueueService {
  constructor(
    @Inject(ConfigService) configService: ConfigService,
    @Inject(AppLogger) logger: AppLogger,
    @Inject(QueueRegistry) registry: QueueRegistry,
    @Inject(forwardRef(() => OutboxService))
    private readonly outboxService: OutboxService,
  ) {
    super(configService, logger, registry);
  }

  protected getQueueName() {
    return PAYMENT_QUEUE_NAME;
  }

  protected getQueueLabel() {
    return "Payment events queue";
  }

  protected async processJob(job: Job) {
    if (job.name === PAYMENT_JOB_NAMES.DISPATCH_OUTBOX) {
      const data = job.data as { outboxId: string };
      await this.outboxService.dispatch(data.outboxId);
    }
    if (job.name === PAYMENT_JOB_NAMES.DRAIN_OUTBOX) {
      await this.outboxService.drain();
    }
  }

  protected override async afterQueueStart() {
    const names = [PAYMENT_JOB_NAMES.DRAIN_OUTBOX] as const;
    await this.scheduleJobs(
      names.map((name) => ({ name, everyMs: PAYMENT_OUTBOX_DRAIN_INTERVAL_MS })),
    );
  }

  enqueueDispatch(outboxId: string) {
    return this.addJob(
      PAYMENT_JOB_NAMES.DISPATCH_OUTBOX,
      { outboxId },
      {
        jobId: `outbox-${outboxId}`,
        removeOnComplete: true,
        removeOnFail: 100,
      },
    );
  }
}
