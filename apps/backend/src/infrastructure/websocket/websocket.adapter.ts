import type { INestApplication } from "@nestjs/common";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import type Redis from "ioredis";
import type { ServerOptions } from "socket.io";
import type { RedisService } from "../redis/redis.service";
import type { WebSocketConfig } from "./types/websocket.types";

export class ConfigurableSocketIoAdapter extends IoAdapter {
  private readonly config: WebSocketConfig;
  private readonly redis: RedisService;
  private pubClient: Redis | null = null;
  private subClient: Redis | null = null;

  constructor(app: INestApplication, config: WebSocketConfig, redis: RedisService) {
    super(app);
    this.config = config;
    this.redis = redis;
  }

  async connect() {
    this.pubClient = this.redis.createClient();
    this.subClient = this.redis.createClient();
    await Promise.all([this.pubClient.connect(), this.subClient.connect()]);
  }

  /** True when Redis pub/sub clients for the Socket.IO adapter are connected. */
  isConnected(): boolean {
    return (
      this.pubClient !== null &&
      this.subClient !== null &&
      (this.pubClient.status === "ready" || this.pubClient.status === "connect") &&
      (this.subClient.status === "ready" || this.subClient.status === "connect")
    );
  }

  override createIOServer(
    port: number,
    options?: ServerOptions,
  ): ReturnType<IoAdapter["createIOServer"]> {
    if (!this.pubClient || !this.subClient) {
      throw new Error("Socket.IO Redis adapter is not connected; call connect() before listen()");
    }

    const serverOptions: ServerOptions = Object.assign({}, options, {
      cors: {
        origin: this.config.corsOrigin,
        credentials: true,
      },
    });

    const server = super.createIOServer(port, serverOptions);
    server.adapter(createAdapter(this.pubClient, this.subClient));
    return server;
  }

  override async close(server?: unknown): Promise<void> {
    const pubClient = this.pubClient;
    const subClient = this.subClient;
    this.pubClient = null;
    this.subClient = null;

    await Promise.all([closeRedisClient(pubClient), closeRedisClient(subClient)]);

    if (typeof super.close === "function") {
      await super.close(server as never);
    }
  }
}

async function closeRedisClient(client: Redis | null): Promise<void> {
  if (!client) {
    return;
  }

  client.removeAllListeners("error");
  client.on("error", () => undefined);

  try {
    if (client.status === "end" || client.status === "close") {
      return;
    }
    await client.quit();
  } catch {
    try {
      client.disconnect();
    } catch {
      // already closed
    }
  }
}
