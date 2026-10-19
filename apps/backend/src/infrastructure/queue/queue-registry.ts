import { Global, Injectable, Module } from "@nestjs/common";
import type { Queue } from "bullmq";

export type QueueMetric = {
  name: string;
  counts: {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    paused: number;
  };
};

@Injectable()
export class QueueRegistry {
  private readonly queues = new Map<string, Queue>();

  register(name: string, queue: Queue) {
    this.queues.set(name, queue);
  }

  unregister(name: string) {
    this.queues.delete(name);
  }

  getQueues(): Queue[] {
    return [...this.queues.values()];
  }

  async getMetrics(): Promise<QueueMetric[]> {
    const metrics: QueueMetric[] = [];

    for (const [name, queue] of this.queues.entries()) {
      const counts = await queue.getJobCounts(
        "waiting",
        "active",
        "completed",
        "failed",
        "delayed",
      );
      metrics.push({
        name,
        counts: {
          waiting: counts["waiting"] ?? 0,
          active: counts["active"] ?? 0,
          completed: counts["completed"] ?? 0,
          failed: counts["failed"] ?? 0,
          delayed: counts["delayed"] ?? 0,
          paused: counts["paused"] ?? 0,
        },
      });
    }

    return metrics;
  }
}

@Global()
@Module({
  providers: [QueueRegistry],
  exports: [QueueRegistry],
})
export class QueueRegistryModule {}
