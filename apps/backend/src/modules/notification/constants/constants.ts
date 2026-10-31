export const NOTIFICATION_QUEUE_NAME = "notification";

export const NOTIFICATION_JOB_NAMES = {
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

export const DELIVER_PENDING_EVERY_MS = 60_000;
export const DELIVER_PENDING_AFTER_MS = 30_000;
export const DELIVER_PENDING_BATCH = 200;
export const DELIVERY_LEASE_MS = 120_000;
export const DELIVERY_MAX_ATTEMPTS = 8;
export const DELIVERY_RETRY_BASE_MS = 15_000;
export const DELIVERY_RETRY_MAX_MS = 15 * 60 * 1000;

export const CLEANUP_EVERY_MS = 24 * 60 * 60 * 1000;
export const READ_RETENTION_DAYS = 90;
export const UNREAD_RETENTION_DAYS = 180;
