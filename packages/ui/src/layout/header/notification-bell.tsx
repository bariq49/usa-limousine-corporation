"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { Button } from "../../components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../../components/dropdown-menu";
import { ScrollArea } from "../../components/scroll-area";
import { useMediaQuery } from "../../hooks/use-media-query";
import { useNotifications } from "../../providers/notification-context";
import { cn } from "../../utils/cn";
import { formatRelativeTime } from "../../utils/date";

function NotificationList({
  onItemClick,
}: {
  onItemClick?: (() => void) | undefined;
}) {
  const notifications = useNotifications();
  if (!notifications) {
    return null;
  }

  const { items, isLoading, isConnected, onMarkRead, onSelect } = notifications;

  return (
    <>
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <span className="text-sm font-semibold text-default-900">Notifications</span>
        <span
          title={isConnected ? "Live updates on" : "Reconnecting…"}
          className={cn("h-2 w-2 rounded-full", isConnected ? "bg-success" : "bg-default-300")}
        />
      </div>
      <ScrollArea className="max-h-[380px]">
        {isLoading ? (
          <p className="px-4 py-8 text-center text-sm text-default-500">Loading…</p>
        ) : items.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-default-500">
            You have no notifications yet.
          </p>
        ) : (
          items.slice(0, 8).map((item) => {
            const unread = !item.readAt;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (unread) onMarkRead?.(item.id);
                  onSelect?.(item);
                  onItemClick?.();
                }}
                className={cn(
                  "flex w-full cursor-pointer items-start gap-3 border-b border-border px-4 py-3 text-left last:border-b-0",
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
                    <span className="shrink-0 text-xs text-default-500">
                      {formatRelativeTime({ date: item.createdAt })}
                    </span>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-xs text-default-600">{item.body}</p>
                </div>
              </button>
            );
          })
        )}
      </ScrollArea>
      <Link
        href="/notifications"
        onClick={() => onItemClick?.()}
        className="flex cursor-pointer items-center justify-center border-t border-border py-2.5 text-sm font-medium text-primary"
      >
        View all notifications
      </Link>
    </>
  );
}

export function NotificationBell() {
  const notifications = useNotifications();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [open, setOpen] = useState(false);

  if (!notifications) {
    return null;
  }

  const { unreadCount } = notifications;
  const badge = unreadCount > 99 ? "99+" : String(unreadCount);

  const trigger = (
    <Button
      variant="ghost"
      size="icon"
      aria-label={unreadCount ? `Notifications (${unreadCount} unread)` : "Notifications"}
      className="relative h-10 w-10 rounded-full text-default-600 hover:bg-default-100 hover:text-primary dark:text-default-800 dark:hover:bg-default-200"
    >
      <Bell className="h-6 w-6" />
      {unreadCount > 0 ? (
        <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-xs leading-none font-semibold text-destructive-foreground">
          {badge}
        </span>
      ) : null}
    </Button>
  );

  if (!isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="gap-0 rounded-b-none p-0 max-sm:pb-3 sm:max-w-md">
          <DialogHeader className="sr-only">
            <DialogTitle>Notifications</DialogTitle>
            <DialogDescription>Your recent notifications</DialogDescription>
          </DialogHeader>
          <NotificationList onItemClick={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-w-[calc(100vw-2rem)] p-0">
        <NotificationList />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
