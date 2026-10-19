import type { ConfigService } from "@nestjs/config";

export type CheckoutConfig = {
  successUrl?: string;
  cancelUrl?: string;
};

export function getCheckoutConfig(configService: ConfigService): CheckoutConfig {
  const config: CheckoutConfig = {};

  const successUrl = configService.get<string>("PAYMENT_CHECKOUT_SUCCESS_URL")?.trim();
  if (successUrl) {
    config.successUrl = successUrl;
  }

  const cancelUrl = configService.get<string>("PAYMENT_CHECKOUT_CANCEL_URL")?.trim();
  if (cancelUrl) {
    config.cancelUrl = cancelUrl;
  }

  return config;
}
