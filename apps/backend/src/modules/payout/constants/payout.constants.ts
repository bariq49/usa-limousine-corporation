export const PAYOUT_QUEUE_NAME = "payout";

export const PAYOUT_JOB_NAMES = {
  RECONCILE: "payout.reconcile",
} as const;

/** Daily reconcile for stale payouts and ledger mismatches. */
export const PAYOUT_RECONCILE_INTERVAL_MS = 24 * 60 * 60 * 1000;

/** Warn when approved/processing payouts sit longer than this without settlement. */
export const STALE_PAYOUT_MS = 7 * 24 * 60 * 60 * 1000;
