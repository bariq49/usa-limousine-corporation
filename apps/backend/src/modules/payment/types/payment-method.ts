export type PaymentMethodCard = {
  id: string;
  brand: string | null;
  last4: string | null;
  expMonth: number | null;
  expYear: number | null;
  isDefault: boolean;
};

export type SetupSessionInput = {
  customerId: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
};

/** Stripe Checkout Session create params for `mode: "setup"`. */
export type SetupSessionParams = {
  mode: "setup";
  customer: string;
  success_url: string;
  cancel_url: string;
  payment_method_types: ["card"];
  metadata?: Record<string, string>;
  setup_intent_data?: { metadata: Record<string, string> };
};

export type SetupSessionResult = {
  sessionId: string;
  checkoutUrl: string;
};

export type SetupIntentInput = {
  customerId: string;
  metadata?: Record<string, string>;
};

export type SetupIntentCreateParams = {
  customer: string;
  payment_method_types: ["card"];
  usage: "off_session";
  metadata?: Record<string, string>;
};

export type SetupIntentResult = {
  setupIntentId: string;
  clientSecret: string;
};

export type SetupIntentLike = {
  payment_method?: string | { id: string } | null;
  metadata?: Record<string, string> | null;
};

export type ToSetupCompletedPayloadParams = {
  customerId: string;
  setupIntent: SetupIntentLike;
  metadataSource?: Record<string, string> | null;
};

export type SetupCompletedPayload = {
  customerId: string;
  paymentMethodId: string;
  metadata: Record<string, string>;
};

export type EnsureCustomerInput = {
  existingCustomerId?: string | null;
  email?: string | null;
  name?: string | null;
  metadata?: Record<string, string>;
};

/** Stripe Customer create params used by `ensureCustomer`. */
export type EnsureCustomerParams = {
  email?: string;
  name?: string;
  metadata?: Record<string, string>;
};
