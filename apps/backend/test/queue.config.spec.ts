import type { ConfigService } from "@nestjs/config";
import {
  DEFAULT_JOB_OPTIONS,
  getQueueMode,
  QueueMode,
  shouldRunQueueWorkers,
} from "../src/infrastructure/queue/queue.config";

describe("queue.config", () => {
  function configWith(mode?: string): ConfigService {
    return {
      get: (key: string) => (key === "QUEUE_MODE" ? mode : undefined),
    } as ConfigService;
  }

  it("defaults to all and runs workers", () => {
    const mode = getQueueMode(configWith(undefined));
    expect(mode).toBe(QueueMode.All);
    expect(shouldRunQueueWorkers(mode)).toBe(true);
  });

  it("api mode disables workers", () => {
    const mode = getQueueMode(configWith("api"));
    expect(mode).toBe(QueueMode.Api);
    expect(shouldRunQueueWorkers(mode)).toBe(false);
  });

  it("worker mode enables workers", () => {
    const mode = getQueueMode(configWith("worker"));
    expect(mode).toBe(QueueMode.Worker);
    expect(shouldRunQueueWorkers(mode)).toBe(true);
  });

  it("rejects invalid mode", () => {
    expect(() => getQueueMode(configWith("nope"))).toThrow(/QUEUE_MODE/);
  });

  it("exposes shared job defaults", () => {
    expect(DEFAULT_JOB_OPTIONS.attempts).toBe(3);
    expect(DEFAULT_JOB_OPTIONS.removeOnComplete).toBe(100);
  });
});
