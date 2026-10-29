"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  NotificationProvider,
  type NotificationItem,
} from "@usa-limousine-corporation/ui/providers/notification-context";
import { useSocket } from "@/hooks/use-socket";
import {
  useDeleteNotifications,
  useLoadMoreNotifications,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotificationEvents,
  useNotificationList,
} from "@/hooks/queries/use-notifications";


function notificationHref(item: NotificationItem): string | null {
  const data = (item.data ?? {}) as Record<string, unknown>;
  const id = (key: string) => (typeof data[key] === "string" ? (data[key] as string) : null);

  switch (item.type) {
    case "TICKET_CREATED":
    case "TICKET_REPLY":
      return id("ticketId") ? `/help-center/${id("ticketId")}` : "/help-center";
    case "BOOKING_CREATED":
    case "BOOKING_CANCELLED":
      return id("bookingId") ? `/bookings/${id("bookingId")}` : "/pending-bookings";
    case "BLOG_COMMENT_CREATED":
      return id("commentId") ? `/blog-comments?id=${id("commentId")}` : "/blog-comments";
    default:
      return null;
  }
}

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { socket, isConnected } = useSocket();
  const { data, isLoading } = useNotificationList();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const deleteNotifications = useDeleteNotifications();
  const loadMore = useLoadMoreNotifications();
  useNotificationEvents(socket);

  return (
    <NotificationProvider
      items={data?.items ?? []}
      unreadCount={data?.unreadCount ?? 0}
      isLoading={isLoading}
      isConnected={isConnected}
      onMarkRead={(id) => markRead.mutate(id)}
      onMarkAllRead={() => markAllRead.mutate()}
      onDelete={(ids) => deleteNotifications.mutate(ids)}
      hasNextPage={data?.hasNextPage ?? false}
      isLoadingMore={loadMore.isPending}
      onLoadMore={() => {
        if (data?.nextCursor) loadMore.mutate(data.nextCursor);
      }}
      onSelect={(item) => {
        const href = notificationHref(item);
        if (href) router.push(href);
      }}
    >
      {children}
    </NotificationProvider>
  );
}
