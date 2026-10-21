import { Test } from "@nestjs/testing";
import type { TestingModule } from "@nestjs/testing";
import { AppLogger } from "../src/common/logger/app.logger";
import { FirebaseService } from "../src/infrastructure/firebase/firebase.service";
import { PushDeliveryService } from "../src/modules/notification/services/push-delivery.service";
import { TokenResolverRegistry } from "../src/modules/notification/services/push-token-resolver.registry";

describe("PushDeliveryService", () => {
  const sendEachForMulticast = jest.fn();
  const invalidateAll = jest.fn(async () => 2);
  const warn = jest.fn();
  const error = jest.fn();
  const log = jest.fn();

  async function createService() {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PushDeliveryService,
        {
          provide: FirebaseService,
          useValue: {
            isConfigured: () => true,
            sendEachForMulticast,
          },
        },
        {
          provide: TokenResolverRegistry,
          useValue: { invalidateAll },
        },
        {
          provide: AppLogger,
          useValue: { warn, error, log, debug: jest.fn() },
        },
      ],
    }).compile();

    return module.get(PushDeliveryService);
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("leaves tokens unchanged when all sends succeed", async () => {
    sendEachForMulticast.mockResolvedValue({
      successCount: 2,
      failureCount: 0,
      responses: [{ success: true }, { success: true }],
    });

    const service = await createService();
    await service.deliver({
      tokens: ["token-a", "token-b"],
      title: "Test",
      body: "Body",
      data: { type: "TEST" },
    });

    expect(invalidateAll).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledWith(
      expect.stringContaining("push.delivered"),
      PushDeliveryService.name,
    );
  });

  it("clears only permanently invalid tokens via registry", async () => {
    sendEachForMulticast.mockResolvedValue({
      successCount: 2,
      failureCount: 2,
      responses: [
        { success: true },
        { success: false, errorCode: "messaging/registration-token-not-registered" },
        { success: false, errorCode: "messaging/unavailable" },
        { success: false, errorCode: "messaging/invalid-registration-token" },
      ],
    });

    const service = await createService();
    await service.deliver({
      tokens: ["token-a", "token-b", "token-c", "token-d"],
      title: "Test",
      body: "Body",
      data: { type: "TEST" },
    });

    expect(invalidateAll).toHaveBeenCalledWith(["token-b", "token-d"]);
  });

  it("logs and continues when token invalidation fails", async () => {
    sendEachForMulticast.mockResolvedValue({
      successCount: 0,
      failureCount: 1,
      responses: [{ success: false, errorCode: "messaging/registration-token-not-registered" }],
    });
    invalidateAll.mockRejectedValueOnce(new Error("db down"));

    const service = await createService();
    await service.deliver({
      tokens: ["token-a"],
      title: "Test",
      body: "Body",
      data: { type: "TEST" },
    });

    expect(error).toHaveBeenCalled();
  });

  it("returns transiently failed tokens for retry and clears only permanent ones", async () => {
    sendEachForMulticast.mockResolvedValue({
      successCount: 1,
      failureCount: 2,
      responses: [
        { success: true },
        { success: false, errorCode: "messaging/unavailable" },
        { success: false, errorCode: "messaging/registration-token-not-registered" },
      ],
    });

    const service = await createService();
    const result = await service.deliver({
      tokens: ["token-ok", "token-busy", "token-gone"],
      title: "Test",
      body: "Body",
      data: { type: "TEST" },
    });

    expect(result.retryTokens).toEqual(["token-busy"]);
    expect(invalidateAll).toHaveBeenCalledWith(["token-gone"]);
  });
});
