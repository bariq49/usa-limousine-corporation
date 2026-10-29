"use client";

import { useState } from "react";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { Button } from "../button";
import { Card, CardContent } from "../card";
import { Checkbox } from "../checkbox";
import { type NotificationItem, useNotifications } from "../../providers/notification-context";
import { cn } from "../../utils/cn";
import { formatRelativeTime } from "../../utils/date";

type Filter = "all" | "unread";

export function NotificationsPage() {
  const notifications = useNotifications();
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<string[]>([]);

  if (!notifications) return null;

  const { items, unreadCount, isLoading, onMarkRead, onMarkAllRead, onSelect, onDelete } =
    notifications;
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
          <div className="flex items-center gap-1 rounded-md bg-default-100 p-1">
            {(["all", "unread"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={cn(
                  "cursor-pointer rounded px-3 py-1.5 text-sm font-medium transition-colors",
                  filter === value
                    ? "bg-card text-default-900 shadow-xs"
                    : "text-default-500 hover:text-default-900",
                )}
              >
                {value === "all" ? `All (${items.length})` : `Unread (${unreadCount})`}
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
          <label className="flex cursor-pointer items-center gap-3 border-b border-border bg-default-50 px-4 py-2 text-xs font-medium text-default-500 sm:px-5">
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

        {isLoading ? (
          <p className="px-5 py-12 text-center text-sm text-default-500">Loading…</p>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-5 py-14 text-center">
            <Bell className="h-8 w-8 text-default-300" />
            <p className="text-sm text-default-500">
              {filter === "unread" ? "You're all caught up." : "You have no notifications yet."}
            </p>
          </div>
        ) : (
          <ul>
            {visible.map((item) => {
              const unread = !item.readAt;
              return (
                <li
                  key={item.id}
                  className={cn(
                    "flex items-start gap-3 border-b border-border px-4 py-3.5 last:border-b-0 sm:px-5",
                    unread && "bg-primary/5",
                  )}
                >
                  <Checkbox
                    size="sm"
                    className="mt-1"
                    checked={selected.includes(item.id)}
                    onCheckedChange={(checked) => toggle(item.id, checked === true)}
                  />
                  <span
                    className={cn(
                      "mt-2 h-2 w-2 shrink-0 rounded-full",
                      unread ? "bg-primary" : "bg-transparent",
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => open(item)}
                    className="min-w-0 flex-1 cursor-pointer text-left"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                      <p
                        className={cn(
                          "text-sm text-default-900",
                          unread ? "font-semibold" : "font-medium",
                        )}
                      >
                        {item.title}
                      </p>
                      <span className="text-xs text-default-500">
                        {formatRelativeTime({ date: item.createdAt })}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-default-600">{item.body}</p>
                  </button>
                  <div className="flex shrink-0 items-center gap-1">
                    {unread ? (
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Mark as read"
                        title="Mark as read"
                        className="h-8 w-8 text-default-500 hover:text-primary"
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
                      className="h-8 w-8 text-default-500 hover:text-destructive"
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
