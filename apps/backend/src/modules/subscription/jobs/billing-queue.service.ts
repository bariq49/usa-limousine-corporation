import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Job } from "bullmq";
import { AppLogger } from "../../../common/logger/app.logger";
import { BaseQueueService } from "../../../infrastructure/queue/base-queue.service";
import { QueueRegistry } from "../../../infrastructure/queue/queue-registry";
import { BILLING_INTERVAL_MS, BILLING_JOB_NAMES, BILLING_QUEUE_NAME } from "../constants/constants";
import { SubscriptionService } from "../services/subscription.service";

@Injectable()
export class SubscriptionBillingQueueService extends BaseQueueService {
  constructor(
    @Inject(ConfigService) configService: ConfigService,
    @Inject(AppLogger) logger: AppLogger,
    @Inject(QueueRegistry) registry: QueueRegistry,
    @Inject(SubscriptionService) private readonly subscriptions: SubscriptionService,
  ) {
    super(configService, logger, registry);
  }

  protected getQueueName() {
    return BILLING_QUEUE_NAME;
  }

  protected getQueueLabel() {
    return "Subscription billing queue";
  }

  protected async processJob(job: Job) {
    if (job.name === BILLING_JOB_NAMES.CLOSE_PERIODS) {
      await this.subscriptions.closeEndedPeriods();
    }
    if (job.name === BILLING_JOB_NAMES.EXPIRE_PAST_DUE) {
      await this.subscriptions.retryPastDueCharges();
      await this.subscriptions.expirePastDue();
    }
    if (job.name === BILLING_JOB_NAMES.TRIAL_ENDING) {
      await this.subscriptions.notifyTrialEnding();
    }
    if (job.name === BILLING_JOB_NAMES.RECONCILE) {
      await this.subscriptions.reconcileBilling();
    }
  }

  protected override async afterQueueStart() {
    const names = [
      BILLING_JOB_NAMES.CLOSE_PERIODS,
      BILLING_JOB_NAMES.EXPIRE_PAST_DUE,
      BILLING_JOB_NAMES.TRIAL_ENDING,
      BILLING_JOB_NAMES.RECONCILE,
    ] as const;

    await this.scheduleJobs(names.map((name) => ({ name, everyMs: BILLING_INTERVAL_MS })));
  }
}
