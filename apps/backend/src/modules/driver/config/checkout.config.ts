import { BadRequestException } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";
import type { Checkout, CheckoutOptions } from "../types/checkout";

export function getDriverCheckoutConfig(
  configService: ConfigService,
  options: CheckoutOptions = {},
): Checkout {
  const appUrl = configService.get<string>("DRIVER_APP_URL")?.trim().replace(/\/$/, "");
  const successPath = options.successPath ?? "/subscriptions/success";
  const cancelPath = options.cancelPath ?? "/subscriptions/cancel";

  const successUrl = options.successUrl?.trim() || (appUrl ? `${appUrl}${successPath}` : "");
  const cancelUrl = options.cancelUrl?.trim() || (appUrl ? `${appUrl}${cancelPath}` : "");

  if (!successUrl || !cancelUrl) {
    throw new BadRequestException(
      "Checkout successUrl and cancelUrl are required (body or DRIVER_APP_URL)",
    );
  }

  return { successUrl, cancelUrl };
}
