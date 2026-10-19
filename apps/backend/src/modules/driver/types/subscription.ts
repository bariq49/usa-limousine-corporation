import type { Audience, PaymentPurpose } from "@prisma/client";

export type OpenCheckoutStarted = {
  purpose: PaymentPurpose;
  referenceId: string;
  amount: number;
  description: string;
  subscriptionId: string;
  isTrialCheckout?: boolean;
};

export type OpenCheckoutMetadata = {
  planId: string;
  audience: Audience;
};

export type OpenCheckoutResult = {
  subscriptionId: string;
  purpose: PaymentPurpose;
  amount: number;
  checkoutUrl: string;
  sessionId: string;
  paymentId?: string;
  isTrialCheckout?: boolean;
};
