import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import type { Socket } from "socket.io-client";
import type { NotificationItem } from "@usa-limousine-corporation/ui/providers/notification-context";
import {
  deleteNotifications,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/api/notifications";
import type { NotificationList } from "@/lib/api/types";
import { SOCKET_EVENTS } from "@/lib/socket/client";

export const notificationQueryKeys = {
  list: ["notifications"] as const,
};

type ReadEvent = {
  /** Null means every notification was marked read. */
  ids: string[] | null;
  readAt: string;
  unreadCount: number;
};

type RemovedEvent = {
  ids: string[];
  unreadCount: number;
};

/** Copy of the cached list with new items/unread count (no object spread). */
function withChanges(list: NotificationList, items: NotificationItem[], unreadCount: number) {
  const next: NotificationList = {
    items,
    nextCursor: list.nextCursor,
    hasNextPage: list.hasNextPage,
    unreadCount,
  };
  return next;
}

function markItemsRead(items: NotificationItem[], ids: string[] | null, readAt: string) {
  return items.map((item) => {
    if (item.readAt || (ids !== null && !ids.includes(item.id))) {
      return item;
    }
    const read: NotificationItem = {
      id: item.id,
      type: item.type,
      title: item.title,
      body: item.body,
      data: item.data,
      readAt,
      createdAt: item.createdAt,
    };
    return read;
  });
}

export const useNotificationList = () => {
  return useQuery({
    queryKey: notificationQueryKeys.list,
    queryFn: () => getNotifications(),
    staleTime: 30_000,
  });
};

/**
 * Applies live socket events to the cached list: new notifications, and read/removed changes
 * made in another tab or device. Refetches after a reconnect to pick up anything missed.
 */
export const useNotificationEvents = (socket: Socket | null) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) {
      return;
    }

    let connectedBefore = false;
    const onConnect = () => {
      if (connectedBefore) {
        void queryClient.invalidateQueries({ queryKey: notificationQueryKeys.list });
      }
      connectedBefore = true;
    };

    const onCreated = (item: NotificationItem) => {
      queryClient.setQueryData<NotificationList>(notificationQueryKeys.list, (list) => {
        if (!list || list.items.some((existing) => existing.id === item.id)) {
          return list;
        }
        return withChanges(
          list,
          [item].concat(list.items),
          list.unreadCount + (item.readAt ? 0 : 1),
        );
      });
      toast(item.title, { icon: "🔔" });
    };

    const onRead = (event: ReadEvent) => {
      queryClient.setQueryData<NotificationList>(notificationQueryKeys.list, (list) =>
        list
          ? withChanges(list, markItemsRead(list.items, event.ids, event.readAt), event.unreadCount)
          : list,
      );
    };

    const onRemoved = (event: RemovedEvent) => {
      queryClient.setQueryData<NotificationList>(notificationQueryKeys.list, (list) =>
        list
          ? withChanges(
              list,
              list.items.filter((item) => !event.ids.includes(item.id)),
              event.unreadCount,
            )
          : list,
      );
    };

    socket.on("connect", onConnect);
    socket.on(SOCKET_EVENTS.NOTIFICATION_CREATED, onCreated);
    socket.on(SOCKET_EVENTS.NOTIFICATION_READ, onRead);
    socket.on(SOCKET_EVENTS.NOTIFICATION_REMOVED, onRemoved);
    return () => {
      socket.off("connect", onConnect);
      socket.off(SOCKET_EVENTS.NOTIFICATION_CREATED, onCreated);
      socket.off(SOCKET_EVENTS.NOTIFICATION_READ, onRead);
      socket.off(SOCKET_EVENTS.NOTIFICATION_REMOVED, onRemoved);
    };
  }, [socket, queryClient]);
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationRead,
    onMutate: (id: string) => {
      queryClient.setQueryData<NotificationList>(notificationQueryKeys.list, (list) => {
        const target = list?.items.find((item) => item.id === id);
        if (!list || !target || target.readAt) {
          return list;
        }
        return withChanges(
          list,
          markItemsRead(list.items, [id], new Date().toISOString()),
          Math.max(0, list.unreadCount - 1),
        );
      });
    },
    onError: () => {
      void queryClient.invalidateQueries({ queryKey: notificationQueryKeys.list });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsRead,
    onMutate: () => {
      queryClient.setQueryData<NotificationList>(notificationQueryKeys.list, (list) =>
        list
          ? withChanges(list, markItemsRead(list.items, null, new Date().toISOString()), 0)
          : list,
      );
    },
    onError: () => {
      toast.error("Failed to mark notifications as read.");
      void queryClient.invalidateQueries({ queryKey: notificationQueryKeys.list });
    },
  });
};

export const useDeleteNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNotifications,
    onMutate: (ids: string[]) => {
      queryClient.setQueryData<NotificationList>(notificationQueryKeys.list, (list) => {
        if (!list) {
          return list;
        }
        const removedUnread = list.items.filter((item) => ids.includes(item.id) && !item.readAt);
        return withChanges(
          list,
          list.items.filter((item) => !ids.includes(item.id)),
          Math.max(0, list.unreadCount - removedUnread.length),
        );
      });
    },
    onSuccess: (_result, ids) => {
      toast.success(
        ids.length === 1 ? "Notification deleted." : `${ids.length} notifications deleted.`,
      );
    },
    onError: () => {
      toast.error("Failed to delete notifications.");
      void queryClient.invalidateQueries({ queryKey: notificationQueryKeys.list });
    },
  });
};

export const useLoadMoreNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cursor: string) => getNotifications(cursor),
    onSuccess: (page) => {
      queryClient.setQueryData<NotificationList>(notificationQueryKeys.list, (list) => {
        if (!list) {
          return page;
        }
        const known = new Set(list.items.map((item) => item.id));
        const next: NotificationList = {
          items: list.items.concat(page.items.filter((item) => !known.has(item.id))),
          nextCursor: page.nextCursor,
          hasNextPage: page.hasNextPage,
          unreadCount: page.unreadCount,
        };
        return next;
      });
    },
    onError: () => {
      toast.error("Failed to load more notifications.");
    },
  });
};
