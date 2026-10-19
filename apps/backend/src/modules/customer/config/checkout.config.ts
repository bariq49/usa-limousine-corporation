import { BadRequestException } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";
import type { Checkout, CheckoutOptions } from "../types/checkout";

export function getCustomerCheckoutConfig(
  configService: ConfigService,
  options: CheckoutOptions = {},
): Checkout {
  const appUrl = configService.get<string>("CUSTOMER_APP_URL")?.trim().replace(/\/$/, "");
  const successPath = options.successPath ?? "/payment-methods/success";
  const cancelPath = options.cancelPath ?? "/payment-methods/cancel";

  const successUrl = options.successUrl?.trim() || (appUrl ? `${appUrl}${successPath}` : "");
  const cancelUrl = options.cancelUrl?.trim() || (appUrl ? `${appUrl}${cancelPath}` : "");

  if (!successUrl || !cancelUrl) {
    throw new BadRequestException(
      "Checkout successUrl and cancelUrl are required (body or CUSTOMER_APP_URL)",
    );
  }

  return { successUrl, cancelUrl };
}
