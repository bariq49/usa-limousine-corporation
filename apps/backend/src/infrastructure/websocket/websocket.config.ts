import type { ConfigService } from "@nestjs/config";
import { parseOriginList } from "../../config/env";
import type { WebSocketConfig } from "./types/websocket.types";

export function getWebSocketConfig(configService: ConfigService): WebSocketConfig {
  const corsOrigin = configService.getOrThrow<string>("WS_CORS_ORIGIN");
  const port = configService.get<number>("WS_PORT");
  const maxConnectionsPerUser = configService.get<number>("WS_MAX_CONNECTIONS_PER_USER");
  const connectRateLimitPerMinute = configService.get<number>("WS_CONNECT_RATE_LIMIT_PER_MINUTE");
  const sessionRevalidateSeconds = configService.get<number>("WS_SESSION_REVALIDATE_SECONDS");

  const config: WebSocketConfig = {
    corsOrigin: parseOriginList(corsOrigin),
    maxConnectionsPerUser:
      typeof maxConnectionsPerUser === "number" && Number.isFinite(maxConnectionsPerUser)
        ? maxConnectionsPerUser
        : 5,
    connectRateLimitPerMinute:
      typeof connectRateLimitPerMinute === "number" && Number.isFinite(connectRateLimitPerMinute)
        ? connectRateLimitPerMinute
        : 30,
    sessionRevalidateSeconds:
      typeof sessionRevalidateSeconds === "number" && Number.isFinite(sessionRevalidateSeconds)
        ? sessionRevalidateSeconds
        : 60,
  };

  if (typeof port === "number" && Number.isFinite(port)) {
    config.port = port;
  }

  return config;
}
