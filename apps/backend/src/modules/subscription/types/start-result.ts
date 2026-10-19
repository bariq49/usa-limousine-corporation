import type { PaymentPurpose } from "@prisma/client";

export type StartCheckoutResult = {
  purpose: PaymentPurpose;
  subscriptionId: string;
  referenceId: string;
  amount: number;
  description: string;
  checkoutRequired: true;
  isTrialCheckout?: boolean;
  freeUsedAt: null;
};

export type StartActivatedResult = {
  purpose: PaymentPurpose;
  subscriptionId: string;
  referenceId: string;
  amount: number;
  description: string;
  subscription: unknown;
  checkoutRequired: false;
  freeUsedAt: Date | null;
};

export type StartResult = StartCheckoutResult | StartActivatedResult;
