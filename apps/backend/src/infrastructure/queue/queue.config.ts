import type { ConfigService } from "@nestjs/config";
import type { JobsOptions } from "bullmq";

export enum QueueMode {
  All = "all",
  Api = "api",
  Worker = "worker",
}

export const DEFAULT_JOB_OPTIONS: JobsOptions = {
  removeOnComplete: 100,
  removeOnFail: 50,
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 2_000,
  },
};

export function getQueueMode(configService: ConfigService): QueueMode {
  const raw = (configService.get<string>("QUEUE_MODE") ?? QueueMode.All).trim().toLowerCase();

  if (raw === QueueMode.Api || raw === QueueMode.Worker || raw === QueueMode.All) {
    return raw;
  }

  throw new Error(
    `QUEUE_MODE must be one of: ${QueueMode.All}, ${QueueMode.Api}, ${QueueMode.Worker}`,
  );
}

export function shouldRunQueueWorkers(mode: QueueMode): boolean {
  return mode === QueueMode.All || mode === QueueMode.Worker;
}
