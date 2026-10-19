import type { PaymentPurpose, PaymentStatus, Prisma } from "@prisma/client";

export type MethodSnapshot = {
  provider: string;
  type?: string;
  brand?: string;
  last4?: string;
  expMonth?: number;
  expYear?: number;
  fingerprint?: string;
  walletType?: string;
  paidAt?: string;
  customerId?: string;
  paymentMethodId?: string;
};

export type CheckoutSnapshot = {
  sessionId?: string;
  checkoutUrl?: string;
  paymentIntentId?: string;
  idempotencyKey?: string;
};

export type CheckoutInput = {
  purpose: PaymentPurpose;
  referenceId: string;
  amount: number;
  description: string;
  successUrl?: string;
  cancelUrl?: string;
  transactionId?: string;
  metadata?: Record<string, string>;
  /** Save card for later off-session charges (subscriptions). */
  savePaymentMethod?: boolean;
  /** Existing Stripe customer id when known. */
  customerId?: string;
};

export type CheckoutResult = {
  paymentId: string;
  checkoutUrl: string;
  sessionId: string;
};

export type OffSessionChargeInput = {
  purpose: PaymentPurpose;
  referenceId: string;
  amount: number;
  description: string;
  customerId: string;
  paymentMethodId: string;
  metadata?: Record<string, string>;
};

export type OffSessionChargeResult = { ok: true; paymentId: string } | { ok: false };

export type {
  EnsureCustomerInput,
  EnsureCustomerParams,
  PaymentMethodCard,
  SetupCompletedPayload,
  SetupIntentCreateParams,
  SetupIntentInput,
  SetupIntentLike,
  SetupIntentResult,
  SetupSessionInput,
  SetupSessionParams,
  SetupSessionResult,
  ToSetupCompletedPayloadParams,
} from "./payment-method";

export type CreateInput = {
  purpose: PaymentPurpose;
  referenceId: string;
  amount: Prisma.Decimal | number | string;
  transactionId?: string;
  status?: PaymentStatus;
  method?: MethodSnapshot;
  checkout?: CheckoutSnapshot;
};

/** Upsert payment row before Stripe checkout / off-session charge. */
export type PrepareInput = {
  purpose: PaymentPurpose;
  referenceId: string;
  amount: number;
  method: MethodSnapshot;
  transactionId?: string;
};

export type UpdateInput = {
  amount?: Prisma.Decimal | number | string;
  status?: PaymentStatus;
  method?: MethodSnapshot | null;
  checkout?: CheckoutSnapshot | null;
  failureCode?: string | null;
  failureMessage?: string | null;
  paidAt?: Date | null;
  cancelledAt?: Date | null;
  refundedAt?: Date | null;
  refundedAmount?: Prisma.Decimal | number | string;
};
