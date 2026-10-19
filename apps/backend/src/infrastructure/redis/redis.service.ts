import { Inject, Injectable, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";
import { AppLogger } from "../../common/logger/app.logger";
import { createIoredisOptions, getRedisConfig } from "./redis.config";
import type { RedisConfig } from "./types/redis.types";

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis | null = null;
  private config: RedisConfig | null = null;

  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService,
    @Inject(AppLogger) private readonly logger: AppLogger,
  ) {}

  isConfigured(): boolean {
    return this.client !== null;
  }

  getClient(): Redis {
    if (!this.client) {
      throw new Error("Redis is not available");
    }

    return this.client;
  }

  getConfig(): RedisConfig {
    if (!this.config) {
      this.config = getRedisConfig(this.configService);
    }
    return this.config;
  }

  createClient(): Redis {
    const options = createIoredisOptions(this.getConfig());
    options.maxRetriesPerRequest = null;
    return new Redis(options);
  }

  async onModuleInit() {
    this.config = getRedisConfig(this.configService);
    const options = createIoredisOptions(this.config);
    options.maxRetriesPerRequest = 1;

    this.client = new Redis(options);

    this.client.on("connect", () => this.logger.log("Redis connecting", RedisService.name));
    this.client.on("ready", () => this.logger.log("Redis ready", RedisService.name));
    this.client.on("reconnecting", () => this.logger.warn("Redis reconnecting", RedisService.name));
    this.client.on("end", () => this.logger.warn("Redis connection ended", RedisService.name));
    this.client.on("error", (error: Error) => {
      this.logger.error(`Redis error: ${error.message}`, undefined, RedisService.name);
    });

    try {
      await this.client.connect();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown Redis error";
      await this.client.quit().catch(() => undefined);
      this.client = null;
      throw new Error(`Redis connection failed: ${message}`);
    }
  }

  async onModuleDestroy() {
    const client = this.client;
    this.client = null;
    if (!client) {
      return;
    }

    client.removeAllListeners("error");
    client.on("error", () => undefined);

    try {
      if (client.status !== "end" && client.status !== "close") {
        await client.quit();
      }
    } catch {
      try {
        client.disconnect();
      } catch {
        // already closed
      }
    }
  }

  async ping() {
    return (await this.getClient().ping()) as "PONG";
  }
}
