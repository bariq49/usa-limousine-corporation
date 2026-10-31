import { ConfigService } from "@nestjs/config";
import { Test, type TestingModule } from "@nestjs/testing";
import { AppLogger } from "../src/common/logger/app.logger";
import { QueueRegistry } from "../src/infrastructure/queue/queue-registry";
import { NotificationQueueService } from "../src/modules/notification/jobs/notification-queue.service";
import { NotificationRepository } from "../src/modules/notification/repositories/notification.repository";
import { NotificationService } from "../src/modules/notification/services/notification.service";

describe("NotificationQueueService", () => {
  const deleteExpired = jest.fn(async () => ({ count: 3 }));
  const deliverPending = jest.fn(async () => ({
    claimed: 2,
    delivered: 1,
    failed: 1,
    deadLettered: 0,
  }));
  const getDeliveryStatus = jest.fn(async () => ({
    pending: 1,
    retryScheduled: 2,
    inProgress: 0,
    deadLettered: 0,
  }));

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
          provide: NotificationRepository,
          useValue: { deleteExpired },
        },
        {
          provide: NotificationService,
          useValue: { deliverPending, getDeliveryStatus },
        },
      ],
    }).compile();

    return module.get(NotificationQueueService);
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("delivers pending rows and reports the delivery state", async () => {
    const service = await createService();

    await (service as unknown as { processJob: (job: unknown) => Promise<void> }).processJob({
      name: "DeliverPending",
      data: {},
    });

    expect(deliverPending).toHaveBeenCalledWith(expect.any(Date), 200);
    const [before] = deliverPending.mock.calls[0] as unknown as [Date];
    expect(Date.now() - before.getTime()).toBeGreaterThanOrEqual(30_000);
    expect(getDeliveryStatus).toHaveBeenCalledTimes(1);
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
