import type { ConfigService } from "@nestjs/config";
import { Queue, Worker, type JobsOptions } from "bullmq";
import type { AppLogger } from "../../common/logger/app.logger";
import { createBullMqConnection, getRedisConfig } from "../redis/redis.config";
import { DEFAULT_JOB_OPTIONS, getQueueMode, shouldRunQueueWorkers } from "./queue.config";
import type { QueueRegistry } from "./queue-registry";
import type { BullMqQueueOptions } from "./types/queue.types";

export class BullMqQueue {
  private queue: Queue | null = null;
  private worker: Worker | null = null;
  private label = "queue";
  private queueName = "";

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: AppLogger,
    private readonly registry?: QueueRegistry,
  ) {}

  isReady() {
    return this.queue !== null;
  }

  getQueue() {
    if (!this.queue) {
      throw new Error("Queue is not available");
    }
    return this.queue;
  }

  async start(options: BullMqQueueOptions) {
    this.label = options.label;
    this.queueName = options.name;
    const mode = getQueueMode(this.configService);
    const redis = getRedisConfig(this.configService);
    const connection = createBullMqConnection(redis);
    const shared = {
      connection,
      prefix: redis.bullmqPrefix,
    };

    try {
      this.queue = new Queue(options.name, shared);

      if (shouldRunQueueWorkers(mode)) {
        this.worker = new Worker(options.name, options.processor, shared);
        this.bindWorkerEvents(options);
      }

      await this.queue.waitUntilReady();
      this.registry?.register(options.name, this.queue);
      this.logger.log(
        `${options.label} ready (mode=${mode}, workers=${shouldRunQueueWorkers(mode) ? "on" : "off"})`,
        options.label,
      );
    } catch (error) {
      await this.stop();
      const message = error instanceof Error ? error.message : "Unknown queue error";
      throw new Error(`${options.label} failed: ${message}`);
    }
  }

  async stop() {
    if (this.queueName) {
      this.registry?.unregister(this.queueName);
    }
    if (this.worker) {
      await this.worker.close();
      this.worker = null;
    }
    if (this.queue) {
      await this.queue.close();
      this.queue = null;
    }
  }

  async add(name: string, data: unknown, opts?: JobsOptions) {
    const jobOptions: JobsOptions = Object.assign({}, DEFAULT_JOB_OPTIONS);
    if (opts) {
      Object.assign(jobOptions, opts);
    }
    return this.getQueue().add(name, data, jobOptions);
  }

  async ping() {
    if (!this.queue) {
      return false;
    }
    await this.queue.getJobCounts();
    return true;
  }

  private bindWorkerEvents(options: BullMqQueueOptions) {
    if (!this.worker) {
      return;
    }

    this.worker.on("failed", (job, error) => {
      this.logger.error(
        `${this.label} job failed (id=${job?.id ?? "unknown"} name=${job?.name ?? "unknown"}): ${error.message}`,
        undefined,
        this.label,
      );
      if (options.onFailed) {
        options.onFailed(job, error);
      }
    });

    this.worker.on("error", (error) => {
      this.logger.error(`${this.label} worker error: ${error.message}`, undefined, this.label);
    });
  }
}
