import type { ConfigService } from "@nestjs/config";
import type { Config, ModeKeys } from "./types/stripe";

export function getStripeConfig(configService: ConfigService): Config {
  const test: ModeKeys = {};
  const testSecretKey = configService.get<string>("STRIPE_SECRET_KEY_TEST")?.trim();
  if (testSecretKey) {
    test.secretKey = testSecretKey;
  }
  const testWebhookSecret = configService.get<string>("STRIPE_WEBHOOK_SECRET_TEST")?.trim();
  if (testWebhookSecret) {
    test.webhookSecret = testWebhookSecret;
  }

  const live: ModeKeys = {};
  const liveSecretKey = configService.get<string>("STRIPE_SECRET_KEY_LIVE")?.trim();
  if (liveSecretKey) {
    live.secretKey = liveSecretKey;
  }
  const liveWebhookSecret = configService.get<string>("STRIPE_WEBHOOK_SECRET_LIVE")?.trim();
  if (liveWebhookSecret) {
    live.webhookSecret = liveWebhookSecret;
  }

  const config: Config = { test, live };

  const apiVersion = configService.get<string>("STRIPE_API_VERSION")?.trim();
  if (apiVersion) {
    config.apiVersion = apiVersion;
  }

  const timeoutMs = configService.get<number>("STRIPE_TIMEOUT_MS");
  if (typeof timeoutMs === "number" && Number.isFinite(timeoutMs)) {
    config.timeoutMs = timeoutMs;
  }

  const maxNetworkRetries = configService.get<number>("STRIPE_MAX_NETWORK_RETRIES");
  if (typeof maxNetworkRetries === "number" && Number.isFinite(maxNetworkRetries)) {
    config.maxNetworkRetries = maxNetworkRetries;
  }

  return config;
}
