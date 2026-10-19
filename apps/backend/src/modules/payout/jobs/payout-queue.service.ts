import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Job } from "bullmq";
import { AppLogger } from "../../../common/logger/app.logger";
import { BaseQueueService } from "../../../infrastructure/queue/base-queue.service";
import { QueueRegistry } from "../../../infrastructure/queue/queue-registry";
import {
  PAYOUT_JOB_NAMES,
  PAYOUT_QUEUE_NAME,
  PAYOUT_RECONCILE_INTERVAL_MS,
} from "../constants/payout.constants";
import { PayoutService } from "../services/payout.service";

@Injectable()
export class PayoutQueueService extends BaseQueueService {
  constructor(
    @Inject(ConfigService) configService: ConfigService,
    @Inject(AppLogger) logger: AppLogger,
    @Inject(QueueRegistry) registry: QueueRegistry,
    @Inject(PayoutService) private readonly payouts: PayoutService,
  ) {
    super(configService, logger, registry);
  }

  protected getQueueName() {
    return PAYOUT_QUEUE_NAME;
  }

  protected getQueueLabel() {
    return "Payout queue";
  }

  protected async processJob(job: Job) {
    if (job.name === PAYOUT_JOB_NAMES.RECONCILE) {
      await this.payouts.reconcile();
    }
  }

  protected override async afterQueueStart() {
    await this.scheduleJobs([
      { name: PAYOUT_JOB_NAMES.RECONCILE, everyMs: PAYOUT_RECONCILE_INTERVAL_MS },
    ]);
  }
}
