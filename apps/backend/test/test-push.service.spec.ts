import { Test, type TestingModule } from "@nestjs/testing";
import { FirebaseService } from "../src/infrastructure/firebase/firebase.service";
import { TestPushService } from "../src/modules/notification/services/test-push.service";

describe("TestPushService", () => {
  const isConfigured = jest.fn();
  const send = jest.fn();

  async function createService() {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TestPushService, { provide: FirebaseService, useValue: { isConfigured, send } }],
    }).compile();

    return module.get(TestPushService);
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns the Firebase config error without sending", async () => {
    isConfigured.mockReturnValue(false);

    const service = await createService();
    const result = await service.test({ token: "tok" });

    expect(send).not.toHaveBeenCalled();
    expect(result).toEqual({
      ok: false,
      firebase: false,
      error: "Firebase is not configured",
    });
  });

  it("returns messageId when FCM accepts the token", async () => {
    isConfigured.mockReturnValue(true);
    send.mockResolvedValue({ messageId: "mid-1" });

    const service = await createService();
    const result = await service.test({ token: "tok" });

    expect(send).toHaveBeenCalled();
    expect(result).toEqual({
      ok: true,
      firebase: true,
      messageId: "mid-1",
    });
  });

  it("returns the FCM error code when send fails", async () => {
    isConfigured.mockReturnValue(true);
    send.mockRejectedValue({
      code: "messaging/registration-token-not-registered",
      message: "Requested entity was not found.",
    });

    const service = await createService();
    const result = await service.test({ token: "bad" });

    expect(result).toEqual({
      ok: false,
      firebase: true,
      error: "Requested entity was not found.",
      code: "messaging/registration-token-not-registered",
    });
  });
});
