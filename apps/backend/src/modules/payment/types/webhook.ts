import type { Request } from "express";
import type Stripe from "stripe";
import type { EventPayload } from "./events";
import type { MethodSnapshot, UpdateInput } from "./payment";

export type WebhookRequest = Request & {
  rawBody?: Buffer;
};

export type WebhookHeaders = Record<string, string | string[] | undefined>;

export type WebhookBody = Buffer | string;

export type WebhookResult = {
  received: true;
  ignored?: true;
};

export type StripeCheckoutSession = Stripe.Checkout.Session;

export type StripePaymentIntent = Stripe.PaymentIntent;

export type StripeCharge = Stripe.Charge;

export type StripeEvent = Stripe.Event;

export type ResolveInput = {
  existing: MethodSnapshot;
  livemode: boolean;
  paymentIntentId?: string;
};

export type SucceededInput = {
  paymentId: string;
  purpose: EventPayload["purpose"];
  referenceId: string;
  data: UpdateInput;
};

export type CommitInput = {
  paymentId: string;
  data: UpdateInput;
  event: string;
  payload: EventPayload;
};
