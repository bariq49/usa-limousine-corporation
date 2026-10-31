"use client";

import { useState } from "react";
import {
  Bell,
  CheckCheck,
  Trash2,
  CalendarCheck,
  MessageSquare,
  CreditCard,
  ShieldAlert,
  Info,
} from "lucide-react";
import { Button } from "../button";
import { Card, CardContent } from "../card";
import { Checkbox } from "../checkbox";
import { type NotificationItem, useNotifications } from "../../providers/notification-context";
import { cn } from "../../utils/cn";
import { formatRelativeTime } from "../../utils/date";
import { NotificationListSkeleton } from "../../skeletons/notification-skeleton";

type Filter = "all" | "unread";

const TYPE_CONFIG: Record<string, { icon: typeof Bell; bg: string; text: string }> = {
  booking: { icon: CalendarCheck, bg: "bg-primary/10", text: "text-primary" },
  payment: { icon: CreditCard, bg: "bg-emerald-500/10", text: "text-emerald-600" },
  ticket: { icon: MessageSquare, bg: "bg-amber-500/10", text: "text-amber-600" },
  security: { icon: ShieldAlert, bg: "bg-red-500/10", text: "text-red-600" },
  info: { icon: Info, bg: "bg-sky-500/10", text: "text-sky-600" },
};

const DEFAULT_CONFIG = { icon: Bell, bg: "bg-default-100", text: "text-default-600" };

function getTypeConfig(type: string) {
  const key = Object.keys(TYPE_CONFIG).find((k) => type.toLowerCase().includes(k));
  return (key ? TYPE_CONFIG[key] : undefined) ?? DEFAULT_CONFIG;
}

export function NotificationList() {
  const notifications = useNotifications();
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<string[]>([]);

  if (!notifications) return null;

  const { items, unreadCount, isLoading, onMarkRead, onMarkAllRead, onSelect, onDelete } =
    notifications;

  if (isLoading) return <NotificationListSkeleton />;

  const visible = filter === "unread" ? items.filter((item) => !item.readAt) : items;
  const selectedVisible = selected.filter((id) => visible.some((item) => item.id === id));
  const allSelected = visible.length > 0 && selectedVisible.length === visible.length;

  const toggle = (id: string, checked: boolean) =>
    setSelected((current) =>
      checked ? current.concat(id) : current.filter((value) => value !== id),
    );

  const remove = (ids: string[]) => {
    onDelete?.(ids);
    setSelected((current) => current.filter((id) => !ids.includes(id)));
  };

  const markSelectedRead = () => {
    visible
      .filter((item) => selectedVisible.includes(item.id) && !item.readAt)
      .forEach((item) => onMarkRead?.(item.id));
    setSelected([]);
  };

  const open = (item: NotificationItem) => {
    if (!item.readAt) onMarkRead?.(item.id);
    onSelect?.(item);
  };

  return (
    <Card className="overflow-hidden shadow-xs">
      <CardContent className="p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
          <div className="flex items-center gap-1 rounded-lg bg-default-100 p-1">
            {(["all", "unread"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={cn(
                  "cursor-pointer rounded-md px-3.5 py-1.5 text-sm font-medium transition-all duration-200",
                  filter === value
                    ? "bg-card text-default-900 shadow-sm"
                    : "text-default-500 hover:text-default-700",
                )}
              >
                {value === "all" ? "All" : "Unread"}
                <span
                  className={cn(
                    "ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-semibold",
                    filter === value
                      ? "bg-primary/10 text-primary"
                      : "bg-default-200 text-default-600",
                  )}
                >
                  {value === "all" ? items.length : unreadCount}
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {selectedVisible.length > 0 ? (
              <>
                <Button size="sm" variant="outline" className="gap-1.5" onClick={markSelectedRead}>
                  <CheckCheck className="h-4 w-4" />
                  Mark read
                </Button>
                <Button
                  size="sm"
                  color="destructive"
                  className="gap-1.5"
                  onClick={() => remove(selectedVisible)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete ({selectedVisible.length})
                </Button>
              </>
            ) : unreadCount > 0 && onMarkAllRead ? (
              <Button size="sm" variant="outline" className="gap-1.5" onClick={onMarkAllRead}>
                <CheckCheck className="h-4 w-4" />
                Mark all as read
              </Button>
            ) : null}
          </div>
        </div>

        {visible.length > 0 ? (
          <label className="flex cursor-pointer items-center gap-3 border-b border-border bg-default-50/60 px-4 py-2.5 text-xs font-medium text-default-500 sm:px-5">
            <Checkbox
              size="sm"
              checked={allSelected}
              onCheckedChange={(checked) =>
                setSelected(checked === true ? visible.map((item) => item.id) : [])
              }
            />
            Select all
          </label>
        ) : null}

        {visible.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-5 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-default-100">
              <Bell className="h-6 w-6 text-default-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-default-700">
                {filter === "unread" ? "You're all caught up" : "No notifications yet"}
              </p>
              <p className="mt-0.5 text-xs text-default-500">
                {filter === "unread"
                  ? "All your notifications have been read."
                  : "When you receive notifications, they will appear here."}
              </p>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {visible.map((item) => {
              const unread = !item.readAt;
              const config = getTypeConfig(item.type);
              const Icon = config.icon;

              return (
                <li
                  key={item.id}
                  className={cn(
                    "group relative flex items-start gap-3.5 px-4 py-4 transition-colors duration-150 sm:px-5",
                    unread ? "bg-primary/[0.03]" : "hover:bg-default-50/60",
                  )}
                >
                  {unread ? (
                    <span className="absolute left-0 top-0 h-full w-0.5 bg-primary" />
                  ) : null}

                  <Checkbox
                    size="sm"
                    className="mt-2"
                    checked={selected.includes(item.id)}
                    onCheckedChange={(checked) => toggle(item.id, checked === true)}
                  />

                  <div
                    className={cn(
                      "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                      config.bg,
                    )}
                  >
                    <Icon className={cn("h-4 w-4", config.text)} />
                  </div>

                  <button
                    type="button"
                    onClick={() => open(item)}
                    className="min-w-0 flex-1 cursor-pointer text-left"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                      <p
                        className={cn(
                          "text-sm leading-snug text-default-900",
                          unread ? "font-semibold" : "font-medium",
                        )}
                      >
                        {item.title}
                      </p>
                      <span className="whitespace-nowrap text-xs text-default-400">
                        {formatRelativeTime({ date: item.createdAt })}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-[13px] leading-relaxed text-default-500">
                      {item.body}
                    </p>
                  </button>

                  <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                    {unread ? (
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Mark as read"
                        title="Mark as read"
                        className="h-8 w-8 text-default-400 hover:text-primary"
                        onClick={() => onMarkRead?.(item.id)}
                      >
                        <CheckCheck className="h-4 w-4" />
                      </Button>
                    ) : null}
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Delete notification"
                      title="Delete"
                      className="h-8 w-8 text-default-400 hover:text-destructive"
                      onClick={() => remove([item.id])}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {notifications.hasNextPage && notifications.onLoadMore ? (
          <div className="flex justify-center border-t border-border px-5 py-3">
            <Button
              size="sm"
              variant="outline"
              isLoading={notifications.isLoadingMore === true}
              onClick={notifications.onLoadMore}
            >
              Load more
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
