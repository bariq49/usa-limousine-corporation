import type { INestApplication } from "@nestjs/common";
import { ConfigurableSocketIoAdapter } from "../src/infrastructure/websocket/websocket.adapter";
import { SocketIoAdapterLifecycle } from "../src/infrastructure/websocket/socket-io-adapter.lifecycle";
import type { RedisService } from "../src/infrastructure/redis/redis.service";

function createMockRedisClient(overrides?: {
  quit?: () => Promise<string>;
  disconnect?: () => void;
}) {
  return {
    connect: jest.fn(async () => undefined),
    quit: overrides?.quit ?? jest.fn(async () => "OK"),
    disconnect: overrides?.disconnect ?? jest.fn(),
    removeAllListeners: jest.fn(),
    on: jest.fn(),
    status: "ready",
  };
}

describe("SocketIoAdapterLifecycle", () => {
  it("closes adapter pub/sub clients on shutdown without double-close errors", async () => {
    const quit = jest.fn(async () => "OK");
    const redis = {
      createClient: () => createMockRedisClient({ quit }),
    } as unknown as RedisService;

    const app = {} as INestApplication;
    const adapter = new ConfigurableSocketIoAdapter(
      app,
      {
        corsOrigin: "http://localhost:3001",
        maxConnectionsPerUser: 5,
        connectRateLimitPerMinute: 30,
        sessionRevalidateSeconds: 60,
      },
      redis,
    );

    await adapter.connect();
    const lifecycle = new SocketIoAdapterLifecycle();
    lifecycle.register(adapter);

    await lifecycle.onApplicationShutdown();
    await lifecycle.onApplicationShutdown();

    expect(quit).toHaveBeenCalledTimes(2);
  });

  it("disconnects adapter clients if quit fails", async () => {
    const disconnect = jest.fn();
    const redis = {
      createClient: () =>
        createMockRedisClient({
          quit: jest.fn(async () => {
            throw new Error("already closed");
          }),
          disconnect,
        }),
    } as unknown as RedisService;

    const adapter = new ConfigurableSocketIoAdapter(
      {} as INestApplication,
      {
        corsOrigin: "http://localhost:3001",
        maxConnectionsPerUser: 5,
        connectRateLimitPerMinute: 30,
        sessionRevalidateSeconds: 60,
      },
      redis,
    );

    await adapter.connect();
    await adapter.close();

    expect(disconnect).toHaveBeenCalledTimes(2);
  });
});
