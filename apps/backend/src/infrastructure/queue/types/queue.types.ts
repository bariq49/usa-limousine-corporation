import type { Job, JobsOptions, Processor } from "bullmq";

export type BullMqQueueOptions = {
  name: string;
  label: string;
  processor: Processor;
  onFailed?: ((job: Job | undefined, error: Error) => void) | undefined;
};

export type { JobsOptions };
