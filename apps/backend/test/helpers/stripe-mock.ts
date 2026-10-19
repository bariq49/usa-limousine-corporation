import { PaymentMode } from "@prisma/client";
import { StripeService } from "../../src/infrastructure/stripe/stripe.service";

/** Nest override for e2e suites that hit public booking → Stripe Checkout. */
export const stripeCheckoutMock = {
  provide: StripeService,
  useValue: {
    isConfigured: () => true,
    getPaymentMode: async () => PaymentMode.TEST,
    getClientForSettings: async () => ({
      checkout: {
        sessions: {
          create: async () => ({
            id: "cs_test_e2e",
            url: "https://checkout.stripe.com/c/pay/cs_test_e2e",
            payment_intent: "pi_test_e2e",
          }),
        },
      },
    }),
    getClient: () => ({
      checkout: {
        sessions: {
          create: async () => ({
            id: "cs_test_e2e",
            url: "https://checkout.stripe.com/c/pay/cs_test_e2e",
            payment_intent: "pi_test_e2e",
          }),
        },
      },
      paymentIntents: {
        retrieve: async () => ({ payment_method: null }),
      },
    }),
    healthCheck: async () => true,
  },
};
