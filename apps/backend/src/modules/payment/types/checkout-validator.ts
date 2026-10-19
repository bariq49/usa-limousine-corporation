import type { PaymentPurpose } from "@prisma/client";
import type { CheckoutInput } from "./payment";

export interface PurposeValidator {
  readonly purpose: PaymentPurpose;
  validate(input: CheckoutInput): Promise<void>;
}
