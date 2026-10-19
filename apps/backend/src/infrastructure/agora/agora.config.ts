import type { ConfigService } from "@nestjs/config";
import type { Config } from "./types/agora";

export const DEFAULT_TOKEN_TTL_SECONDS = 3600;

export function getConfig(configService: ConfigService): Config {
  const config: Config = {
    tokenTtlSeconds: DEFAULT_TOKEN_TTL_SECONDS,
  };

  const appId = configService.get<string>("AGORA_APP_ID")?.trim();
  if (appId) {
    config.appId = appId;
  }

  const appCertificate = configService.get<string>("AGORA_APP_CERTIFICATE")?.trim();
  if (appCertificate) {
    config.appCertificate = appCertificate;
  }

  const ttl = configService.get<number>("AGORA_TOKEN_TTL_SECONDS");
  if (typeof ttl === "number" && Number.isFinite(ttl) && ttl > 0) {
    config.tokenTtlSeconds = Math.floor(ttl);
  }

  return config;
}

export function isComplete(
  config: Config,
): config is Config & Required<Pick<Config, "appId" | "appCertificate">> {
  return Boolean(config.appId && config.appCertificate);
}
