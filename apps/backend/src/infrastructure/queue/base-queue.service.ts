import { type OnModuleDestroy, type OnModuleInit } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";
import type { Job, JobsOptions } from "bullmq";
import type { AppLogger } from "../../common/logger/app.logger";
import { BullMqQueue } from "./bullmq-queue";
import type { QueueRegistry } from "./queue-registry";

export type RepeatableJob = {
  name: string;
  everyMs: number;
};

export abstract class BaseQueueService implements OnModuleInit, OnModuleDestroy {
  protected readonly bullQueue: BullMqQueue;
  protected readonly logger: AppLogger;

  protected constructor(configService: ConfigService, logger: AppLogger, registry?: QueueRegistry) {
    this.bullQueue = new BullMqQueue(configService, logger, registry);
    this.logger = logger;
  }

  protected abstract getQueueName(): string;
  protected abstract getQueueLabel(): string;
  protected abstract processJob(job: Job): Promise<unknown>;

  isConfigured() {
    return this.bullQueue.isReady();
  }

  async onModuleInit() {
    await this.bullQueue.start({
      name: this.getQueueName(),
      label: this.getQueueLabel(),
      processor: (job) => this.processJob(job),
    });
    await this.afterQueueStart();
  }

  protected async afterQueueStart(): Promise<void> {}

  async onModuleDestroy() {
    await this.bullQueue.stop();
  }

  protected addJob(name: string, data: unknown, opts?: JobsOptions) {
    return this.bullQueue.add(name, data, opts);
  }

  protected async scheduleJobs(jobs: readonly RepeatableJob[]) {
    try {
      const queue = this.bullQueue.getQueue();
      for (const job of jobs) {
        await queue.upsertJobScheduler(
          job.name,
          { every: job.everyMs },
          {
            name: job.name,
            data: {},
            opts: { removeOnComplete: 10, removeOnFail: 20 },
          },
        );
      }
    } catch (error) {
      await this.bullQueue.stop();
      const message = error instanceof Error ? error.message : "Unknown queue error";
      throw new Error(`${this.getQueueLabel()} failed: ${message}`);
    }
  }
}
