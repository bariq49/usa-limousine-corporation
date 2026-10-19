import type { INestApplication } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { QueueRegistry } from "../src/infrastructure/queue/queue-registry";

jest.mock("@bull-board/api", () => ({
  createBullBoard: jest.fn(),
}));

jest.mock("@bull-board/api/bullMQAdapter", () => ({
  BullMQAdapter: jest.fn().mockImplementation(() => ({})),
}));

jest.mock("@bull-board/express", () => ({
  ExpressAdapter: jest.fn().mockImplementation(() => ({
    setBasePath: jest.fn(),
    getRouter: jest.fn(() => jest.fn()),
  })),
}));

import { createBullBoard } from "@bull-board/api";
import { mountQueueBoard } from "../src/infrastructure/queue/queue-board";

describe("mountQueueBoard", () => {
  function createApp(config: Record<string, string | undefined>) {
    const use = jest.fn();
    const get = jest.fn((key: string) => config[key]);
    const registry = {
      getQueues: () => [{ name: "test-queue" }],
    } as unknown as QueueRegistry;

    const app = {
      get: (token: unknown) => {
        if (token === ConfigService) {
          return { get } as unknown as ConfigService;
        }
        if (token === QueueRegistry) {
          return registry;
        }
        throw new Error("unknown token");
      },
      use,
    } as unknown as INestApplication;

    return { app, use };
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns null when board is disabled", () => {
    const { app, use } = createApp({ QUEUE_BOARD_ENABLED: "false" });
    expect(mountQueueBoard(app)).toBeNull();
    expect(use).not.toHaveBeenCalled();
  });

  it("throws when enabled without credentials", () => {
    const { app } = createApp({ QUEUE_BOARD_ENABLED: "true" });
    expect(() => mountQueueBoard(app)).toThrow(/QUEUE_BOARD_USERNAME/);
  });

  it("mounts board with basic auth middleware when enabled", () => {
    const { app, use } = createApp({
      QUEUE_BOARD_ENABLED: "true",
      QUEUE_BOARD_USERNAME: "admin",
      QUEUE_BOARD_PASSWORD: "secret",
      QUEUE_BOARD_PATH: "/admin/queues",
    });

    const path = mountQueueBoard(app);
    expect(path).toBe("/admin/queues");
    expect(createBullBoard).toHaveBeenCalled();
    expect(use).toHaveBeenCalledWith("/admin/queues", expect.any(Function), expect.any(Function));

    const auth = use.mock.calls[0]?.[1] as (
      req: { headers: { authorization?: string } },
      res: { setHeader: jest.Mock; status: jest.Mock; send: jest.Mock },
      next: jest.Mock,
    ) => void;

    const unauthorizedRes = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    auth({ headers: {} }, unauthorizedRes, jest.fn());
    expect(unauthorizedRes.status).toHaveBeenCalledWith(401);

    const rejected = jest.fn();
    const wrongPassword = Buffer.from("admin:wrong").toString("base64");
    auth({ headers: { authorization: `Basic ${wrongPassword}` } }, unauthorizedRes, rejected);
    expect(rejected).not.toHaveBeenCalled();

    const next = jest.fn();
    const authorized = Buffer.from("admin:secret").toString("base64");
    auth({ headers: { authorization: `Basic ${authorized}` } }, unauthorizedRes, next);
    expect(next).toHaveBeenCalled();
  });
});
