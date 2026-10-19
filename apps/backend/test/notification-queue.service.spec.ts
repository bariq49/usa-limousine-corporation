import { ConfigService } from "@nestjs/config";
import { Test, type TestingModule } from "@nestjs/testing";
import { AppLogger } from "../src/common/logger/app.logger";
import { QueueRegistry } from "../src/infrastructure/queue/queue-registry";
import { NotificationQueueService } from "../src/modules/notification/jobs/notification-queue.service";
import { PushDeliveryService } from "../src/modules/notification/services/push-delivery.service";

describe("NotificationQueueService FCM token cleanup", () => {
  const deliver = jest.fn(async () => undefined);

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
});
