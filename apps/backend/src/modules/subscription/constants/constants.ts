export const BILLING_QUEUE_NAME = "subscription-billing";

export const BILLING_JOB_NAMES = {
  CLOSE_PERIODS: "subscription.close_periods",
  EXPIRE_PAST_DUE: "subscription.expire_past_due",
  TRIAL_ENDING: "subscription.trial_ending",
  RECONCILE: "subscription.reconcile",
} as const;

/** Daily scheduler interval for billing lifecycle jobs. */
export const BILLING_INTERVAL_MS = 24 * 60 * 60 * 1000;

/** Remind owners this many ms before trialEnd (≈ 3 days). */
export const TRIAL_ENDING_LEAD_MS = 3 * 24 * 60 * 60 * 1000;

/** Max off-session renew attempts during PAST_DUE grace (includes period-end attempt). */
export const DUNNING_MAX_ATTEMPTS = 3;

/** Minimum spacing between dunning charge attempts. */
export const DUNNING_RETRY_INTERVAL_MS = 24 * 60 * 60 * 1000;

/** Alert on subscription checkout rows stuck PENDING longer than this. */
export const STALE_PENDING_PAYMENT_MS = 24 * 60 * 60 * 1000;
