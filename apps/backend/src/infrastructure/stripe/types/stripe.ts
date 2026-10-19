import type Stripe from "stripe";

export type ModeKeys = {
  secretKey?: string;
  webhookSecret?: string;
};

export type Config = {
  test: ModeKeys;
  live: ModeKeys;
  apiVersion?: string;
  timeoutMs?: number;
  maxNetworkRetries?: number;
};

export type Options = Stripe.StripeConfig;

export type Client = Stripe;

export type Event = Stripe.Event;

export type WebhookBody = Buffer | string;

export type WebhookHeaders = Record<string, string | string[] | undefined>;
