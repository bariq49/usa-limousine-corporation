import type { ConfigService } from "@nestjs/config";
import type { ConnectionOptions } from "bullmq";
import type { RedisConfig, RedisSentinelNode } from "./types/redis.types";

const CONNECT_TIMEOUT_MS = 10_000;
const KEEP_ALIVE_MS = 10_000;

export type IoredisClientOptions = {
  host?: string;
  port?: number;
  db: number;
  username?: string;
  password?: string;
  keyPrefix?: string;
  lazyConnect: boolean;
  maxRetriesPerRequest: number | null;
  enableReadyCheck: boolean;
  connectTimeout: number;
  keepAlive: number;
  tls?: { rejectUnauthorized: boolean };
  sentinels?: RedisSentinelNode[];
  name?: string;
};

function parseSentinels(raw: string | undefined): RedisSentinelNode[] {
  if (!raw?.trim()) {
    return [];
  }

  const nodes: RedisSentinelNode[] = [];
  for (const part of raw.split(",")) {
    const trimmed = part.trim();
    if (!trimmed) {
      continue;
    }
    const [host, portRaw] = trimmed.split(":");
    const port = Number(portRaw || 26379);
    if (!host || !Number.isFinite(port) || port <= 0) {
      throw new Error(`REDIS_SENTINELS has an invalid entry: ${trimmed}`);
    }
    nodes.push({ host: host.trim(), port });
  }
  return nodes;
}

export function getRedisConfig(configService: ConfigService): RedisConfig {
  const url = configService.getOrThrow<string>("REDIS_URL").trim();
  if (!url) {
    throw new Error("REDIS_URL is required");
  }

  const parsed = new URL(url);
  if (parsed.protocol !== "redis:" && parsed.protocol !== "rediss:") {
    throw new Error("REDIS_URL must use redis:// or rediss://");
  }

  const port = Number(parsed.port || 6379);
  const db = Number(parsed.pathname.replace(/^\//, "") || 0);
  if (!Number.isFinite(port) || port <= 0) {
    throw new Error("REDIS_URL has an invalid port");
  }
  if (!Number.isFinite(db) || db < 0) {
    throw new Error("REDIS_URL has an invalid database index");
  }

  const prefix = (configService.get<string>("REDIS_KEY_PREFIX")?.trim() ?? "").replace(/:+$/, "");
  const sentinels = parseSentinels(configService.get<string>("REDIS_SENTINELS"));
  const sentinelName = configService.get<string>("REDIS_SENTINEL_NAME")?.trim();
  const rejectUnauthorizedRaw = configService.get<string>("REDIS_TLS_REJECT_UNAUTHORIZED");
  const tlsRejectUnauthorized =
    rejectUnauthorizedRaw === undefined || rejectUnauthorizedRaw === ""
      ? true
      : !["false", "0"].includes(rejectUnauthorizedRaw.trim().toLowerCase());

  if (sentinels.length > 0 && !sentinelName) {
    throw new Error("REDIS_SENTINEL_NAME is required when REDIS_SENTINELS is set");
  }

  const config: RedisConfig = {
    url,
    host: parsed.hostname || "127.0.0.1",
    port,
    db,
    tls: parsed.protocol === "rediss:",
    tlsRejectUnauthorized,
    keyPrefix: prefix ? `${prefix}:` : "",
    bullmqPrefix: prefix ? `${prefix}:bull` : "bull",
  };

  if (parsed.username) {
    config.username = decodeURIComponent(parsed.username);
  }

  if (parsed.password) {
    config.password = decodeURIComponent(parsed.password);
  }

  if (sentinels.length > 0 && sentinelName) {
    config.sentinels = sentinels;
    config.sentinelName = sentinelName;
  }

  return config;
}

export function createIoredisOptions(config: RedisConfig): IoredisClientOptions {
  const options: IoredisClientOptions = {
    db: config.db,
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    connectTimeout: CONNECT_TIMEOUT_MS,
    keepAlive: KEEP_ALIVE_MS,
    lazyConnect: true,
  };

  if (config.username) {
    options.username = config.username;
  }
  if (config.password) {
    options.password = config.password;
  }
  if (config.keyPrefix) {
    options.keyPrefix = config.keyPrefix;
  }
  if (config.tls) {
    options.tls = {
      rejectUnauthorized: config.tlsRejectUnauthorized,
    };
  }

  if (config.sentinels && config.sentinelName) {
    options.sentinels = config.sentinels;
    options.name = config.sentinelName;
    return options;
  }

  options.host = config.host;
  options.port = config.port;
  return options;
}

export function createBullMqConnection(config: RedisConfig): ConnectionOptions {
  const connection: ConnectionOptions = {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    connectTimeout: CONNECT_TIMEOUT_MS,
    keepAlive: KEEP_ALIVE_MS,
  };

  if (config.username) {
    connection.username = config.username;
  }
  if (config.password) {
    connection.password = config.password;
  }
  if (config.tls) {
    connection.tls = {
      rejectUnauthorized: config.tlsRejectUnauthorized,
    };
  }
  if (config.sentinels && config.sentinelName) {
    connection["sentinels"] = config.sentinels;
    connection["name"] = config.sentinelName;
    connection.db = config.db;
    return connection;
  }

  connection.host = config.host;
  connection.port = config.port;
  connection.db = config.db;
  return connection;
}
