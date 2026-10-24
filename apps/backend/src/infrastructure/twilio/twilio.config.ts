import type { ConfigService } from "@nestjs/config";
import type { Config } from "./types/twilio";

export function getConfig(configService: ConfigService): Config {
  const config: Config = {};

  const sid = configService.get<string>("TWILIO_ACCOUNT_SID")?.trim();
  if (sid) {
    config.sid = sid;
  }

  const token = configService.get<string>("TWILIO_AUTH_TOKEN")?.trim();
  if (token) {
    config.token = token;
  }

  const from = configService.get<string>("TWILIO_SENDER_ID")?.trim();
  if (from) {
    config.from = from;
  }

  return config;
}

export function isComplete(
  config: Config,
): config is Required<Pick<Config, "sid" | "token" | "from">> {
  return Boolean(config.sid && config.token && config.from);
}
