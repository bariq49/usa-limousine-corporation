"use client";

import { Bell, CheckCheck } from "lucide-react";
import { Button } from "../../components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/dropdown-menu";
import { ScrollArea } from "../../components/scroll-area";
import { useNotifications } from "../../providers/notification-context";
import { cn } from "../../utils/cn";
import { formatRelativeTime } from "../../utils/date";

export function NotificationBell() {
  const notifications = useNotifications();
  if (!notifications) {
    return null;
  }

  const { items, unreadCount, isLoading, isConnected, onMarkRead, onMarkAllRead, onSelect } =
    notifications;
  const badge = unreadCount > 99 ? "99+" : String(unreadCount);

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={unreadCount ? `Notifications (${unreadCount} unread)` : "Notifications"}
          className="relative h-8 w-8 rounded-full text-default-500 hover:bg-default-100 hover:text-primary md:h-9 md:w-9 dark:text-default-800 dark:hover:bg-default-200"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 ? (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] leading-none font-semibold text-destructive-foreground">
              {badge}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[340px] max-w-[calc(100vw-2rem)] p-0">
        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-default-900">Notifications</span>
            <span
              title={isConnected ? "Live updates on" : "Reconnecting…"}
              className={cn(
                "h-2 w-2 rounded-full",
                isConnected ? "bg-success" : "bg-default-300",
              )}
            />
          </div>
          {onMarkAllRead && unreadCount > 0 ? (
            <button
              type="button"
              onClick={onMarkAllRead}
              className="flex cursor-pointer items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all as read
            </button>
          ) : null}
        </div>
        <ScrollArea className="max-h-[380px]">
          {isLoading ? (
            <p className="px-4 py-8 text-center text-sm text-default-500">Loading…</p>
          ) : items.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-default-500">
              You have no notifications yet.
            </p>
          ) : (
            items.map((item) => {
              const unread = !item.readAt;
              return (
                <DropdownMenuItem
                  key={item.id}
                  onSelect={() => {
                    if (unread) onMarkRead?.(item.id);
                    onSelect?.(item);
                  }}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-none border-b border-border px-4 py-3 last:border-b-0",
                    unread && "bg-primary/5",
                  )}
                >
                  <span
                    className={cn(
                      "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                      unread ? "bg-primary" : "bg-transparent",
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={cn(
                          "truncate text-sm text-default-900",
                          unread ? "font-semibold" : "font-medium",
                        )}
                      >
                        {item.title}
                      </p>
                      <span className="shrink-0 text-[11px] text-default-500">
                        {formatRelativeTime({ date: item.createdAt })}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs text-default-600">{item.body}</p>
                  </div>
                </DropdownMenuItem>
              );
            })
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
