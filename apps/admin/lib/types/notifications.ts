import type { NotificationItem } from "@usa-limousine-corporation/ui/providers/notification-context";

export type NotificationList = {
  items: NotificationItem[];
  /** Pass as `cursor` to load the next page; null on the last page. */
  nextCursor: string | null;
  hasNextPage: boolean;
  unreadCount: number;
};
