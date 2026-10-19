export const PAYMENT_QUEUE_NAME = "payment";

export const PAYMENT_JOB_NAMES = {
  DISPATCH_OUTBOX: "dispatch-outbox",
  DRAIN_OUTBOX: "drain-outbox",
} as const;

/** Stripe charge / checkout currency (ISO lowercase). */
export const PAYMENT_CURRENCY = "eur";

export const PAYMENT_OUTBOX_DRAIN_INTERVAL_MS = 30_000;
export const PAYMENT_OUTBOX_STALE_MS = 30_000;
/** Delete published outbox rows older than this (7 days). */
export const PAYMENT_OUTBOX_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;
