export const NOTIFICATION_QUEUE_NAME = "notification";

export const NOTIFICATION_JOB_NAMES = {
  DELIVER_PUSH: "DeliverPush",
  DELIVER_PENDING: "DeliverPending",
  CLEANUP: "Cleanup",
} as const;

export const NOTIFICATION_WS_EVENTS = {
  CREATED: "notification.created",
  READ: "notification.read",
  REMOVED: "notification.removed",
} as const;

export const DEFAULT_NOTIFICATION_LIMIT = 20;
export const MAX_NOTIFICATION_LIMIT = 100;

/** How often the sweep re-delivers rows that never got their socket emit / push enqueue. */
export const DELIVER_PENDING_EVERY_MS = 60_000;
/** Only sweep rows older than this, so in-flight deliveries are not sent twice. */
export const DELIVER_PENDING_AFTER_MS = 30_000;
export const DELIVER_PENDING_BATCH = 200;

export const CLEANUP_EVERY_MS = 24 * 60 * 60 * 1000;
/** Read notifications older than this are deleted by the cleanup job. */
export const READ_RETENTION_DAYS = 90;
/** Unread notifications are kept longer, then deleted too. */
export const UNREAD_RETENTION_DAYS = 180;

/** Retries for FCM tokens that failed with a transient error. */
export const PUSH_MAX_ATTEMPTS = 3;
export const PUSH_RETRY_DELAY_MS = 5_000;
