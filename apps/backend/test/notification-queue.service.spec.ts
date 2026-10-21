import { ConfigService } from "@nestjs/config";
import { Test, type TestingModule } from "@nestjs/testing";
import { AppLogger } from "../src/common/logger/app.logger";
import { QueueRegistry } from "../src/infrastructure/queue/queue-registry";
import { NotificationQueueService } from "../src/modules/notification/jobs/notification-queue.service";
import { NotificationRepository } from "../src/modules/notification/repositories/notification.repository";
import { NotificationDeliveryService } from "../src/modules/notification/services/notification-delivery.service";
import { PushDeliveryService } from "../src/modules/notification/services/push-delivery.service";

describe("NotificationQueueService", () => {
  const deliver = jest.fn(async () => ({ retryTokens: [] as string[] }));
  const findUndelivered = jest.fn();
  const deleteExpired = jest.fn(async () => ({ count: 3 }));
  const deliverMany = jest.fn(async () => undefined);

  async function createService() {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationQueueService,
        {
          provide: ConfigService,
          useValue: { get: () => undefined },
        },
        {
          provide: AppLogger,
          useValue: { warn: jest.fn(), error: jest.fn(), log: jest.fn(), debug: jest.fn() },
        },
        { provide: QueueRegistry, useValue: { register: jest.fn() } },
        {
          provide: PushDeliveryService,
          useValue: { deliver },
        },
        {
          provide: NotificationRepository,
          useValue: { findUndelivered, deleteExpired },
        },
        {
          provide: NotificationDeliveryService,
          useValue: { deliverMany },
        },
      ],
    }).compile();

    return module.get(NotificationQueueService);
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("delivers immediately when queue is not ready", async () => {
    const service = await createService();
    Object.defineProperty(service, "bullQueue", {
      value: { isReady: () => false },
    });

    const payload = {
      tokens: ["token-a"],
      title: "Test",
      body: "Body",
      data: { type: "TEST" },
    };

    await service.enqueuePush(payload);

    expect(deliver).toHaveBeenCalledWith(payload);
  });

  it("re-queues only transiently failed tokens with the next attempt and a delay", async () => {
    const service = await createService();
    const add = jest.fn(async () => undefined);
    Object.defineProperty(service, "bullQueue", {
      value: { isReady: () => true, add },
    });
    deliver.mockResolvedValueOnce({ retryTokens: ["token-busy"] });

    await (service as unknown as { processJob: (job: unknown) => Promise<void> }).processJob({
      name: "DeliverPush",
      data: {
        tokens: ["token-ok", "token-busy"],
        title: "Test",
        body: "Body",
        data: { type: "TEST", notificationId: "n1" },
      },
    });

    expect(add).toHaveBeenCalledWith(
      "DeliverPush",
      expect.objectContaining({ tokens: ["token-busy"], attempt: 2 }),
      expect.objectContaining({ jobId: "push-n1-2", delay: 5_000 }),
    );
  });

  it("stops retrying after the last attempt", async () => {
    const service = await createService();
    const add = jest.fn(async () => undefined);
    Object.defineProperty(service, "bullQueue", {
      value: { isReady: () => true, add },
    });
    deliver.mockResolvedValueOnce({ retryTokens: ["token-busy"] });

    await (service as unknown as { processJob: (job: unknown) => Promise<void> }).processJob({
      name: "DeliverPush",
      data: { tokens: ["token-busy"], title: "T", body: "B", data: {}, attempt: 3 },
    });

    expect(add).not.toHaveBeenCalled();
  });

  it("sweeps undelivered rows older than the grace period", async () => {
    const service = await createService();
    const pending = [{ id: "n1" }, { id: "n2" }];
    findUndelivered.mockResolvedValueOnce(pending);

    await (service as unknown as { processJob: (job: unknown) => Promise<void> }).processJob({
      name: "DeliverPending",
      data: {},
    });

    expect(findUndelivered).toHaveBeenCalledWith(expect.any(Date), 200);
    const [before] = findUndelivered.mock.calls[0] as unknown as [Date];
    expect(Date.now() - before.getTime()).toBeGreaterThanOrEqual(30_000);
    expect(deliverMany).toHaveBeenCalledWith({ notifications: pending });
  });

  it("deletes expired notifications on cleanup", async () => {
    const service = await createService();

    await (service as unknown as { processJob: (job: unknown) => Promise<void> }).processJob({
      name: "Cleanup",
      data: {},
    });

    const [readBefore, unreadBefore] = deleteExpired.mock.calls[0] as unknown as [Date, Date];
    expect(readBefore.getTime()).toBeGreaterThan(unreadBefore.getTime());
  });
});
