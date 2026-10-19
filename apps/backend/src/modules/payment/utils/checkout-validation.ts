import { BadRequestException, ConflictException } from "@nestjs/common";
import { PaymentPurpose, PaymentStatus } from "@prisma/client";
import type { CheckoutInput } from "../types/payment";

export const BLOCKED_CHECKOUT_STATUSES = new Set<PaymentStatus>([
  PaymentStatus.SUCCEEDED,
  PaymentStatus.REFUNDED,
  PaymentStatus.PARTIALLY_REFUNDED,
]);

const SUBSCRIPTION_PURPOSES = new Set<PaymentPurpose>([
  PaymentPurpose.DRIVER_SUBSCRIPTION,
  PaymentPurpose.AGENCY_SUBSCRIPTION,
]);

export function assertCheckoutPaymentAllowed(status?: PaymentStatus, purpose?: PaymentPurpose) {
  if (!status || !BLOCKED_CHECKOUT_STATUSES.has(status)) {
    return;
  }
  if (purpose && SUBSCRIPTION_PURPOSES.has(purpose) && status === PaymentStatus.SUCCEEDED) {
    return;
  }
  throw new ConflictException(`Payment is already ${status.toLowerCase()}`);
}

export function assertSupportedPurpose(purpose: PaymentPurpose) {
  switch (purpose) {
    case PaymentPurpose.BOOKING:
    case PaymentPurpose.DRIVER_SUBSCRIPTION:
    case PaymentPurpose.AGENCY_SUBSCRIPTION:
      return;
    default:
      throw new BadRequestException("Unsupported payment purpose");
  }
}

export function validateCheckout(input: CheckoutInput) {
  assertSupportedPurpose(input.purpose);
}
