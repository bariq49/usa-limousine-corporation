"use client";

import { createContext, useContext, type ReactNode } from "react";

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  data?: unknown;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationContextValue {
  items: NotificationItem[];
  unreadCount: number;
  isLoading?: boolean | undefined;
  isConnected?: boolean | undefined;
  onMarkRead?: ((id: string) => void) | undefined;
  onMarkAllRead?: (() => void) | undefined;
  onSelect?: ((item: NotificationItem) => void) | undefined;
  onDelete?: ((ids: string[]) => void) | undefined;
  hasNextPage?: boolean | undefined;
  isLoadingMore?: boolean | undefined;
  onLoadMore?: (() => void) | undefined;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider(props: NotificationContextValue & { children: ReactNode }) {
  const value: NotificationContextValue = {
    items: props.items,
    unreadCount: props.unreadCount,
    isLoading: props.isLoading,
    isConnected: props.isConnected,
    onMarkRead: props.onMarkRead,
    onMarkAllRead: props.onMarkAllRead,
    onSelect: props.onSelect,
    onDelete: props.onDelete,
    hasNextPage: props.hasNextPage,
    isLoadingMore: props.isLoadingMore,
    onLoadMore: props.onLoadMore,
  };

  return (
    <NotificationContext.Provider value={value}>{props.children}</NotificationContext.Provider>
  );
}

/** Null when the app has not mounted a NotificationProvider. */
export function useNotifications(): NotificationContextValue | null {
  return useContext(NotificationContext);
}
