export const NOTIFICATION_QUEUE_NAME = "notification";

export const NOTIFICATION_JOB_NAMES = {
  DELIVER_PUSH: "DeliverPush",
} as const;

export const NOTIFICATION_WS_EVENTS = {
  CREATED: "notification.created",
} as const;

export const DEFAULT_NOTIFICATION_PAGE = 1;
export const DEFAULT_NOTIFICATION_LIMIT = 20;
export const MAX_NOTIFICATION_LIMIT = 100;
