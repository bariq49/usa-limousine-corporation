"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "../../components/badge";
import { Button } from "../../components/button";
import { DataTableColumnHeader } from "../data-table-column-header";
import { Laptop, Phone, Tablet, Terminal, Trash } from "../../svg";
import type { Session, SessionOptions } from "../../types/session";
import { formatDateTime, formatRelativeTime } from "../../utils/date";

export type { Session, SessionOptions };

export function formatIpAddress(ip?: string | null): string {
  if (!ip || ip === "—" || ip === "::1" || ip === "::ffff:127.0.0.1") return "127.0.0.1";
  return ip.replace(/^::ffff:/, "").trim() || "127.0.0.1";
}

export function parseUserAgent(ua?: string | null) {
  if (!ua) {
    return {
      device: "Unknown Client",
      browser: "Unknown Browser",
      platform: "Unknown OS",
      deviceType: "desktop" as const,
    };
  }

  if (ua.includes("PostmanRuntime")) {
    const v = ua.split("PostmanRuntime/")[1]?.split(" ")[0];
    return {
      device: "Postman API Client",
      browser: v ? `Postman v${v}` : "Postman",
      platform: "REST API",
      deviceType: "server" as const,
    };
  }

  if (ua.includes("curl/")) {
    return {
      device: "cURL Terminal",
      browser: "cURL",
      platform: "Command Line",
      deviceType: "server" as const,
    };
  }

  const browser = ua.includes("Firefox/")
    ? `Firefox ${ua.split("Firefox/")[1]?.split(" ")[0] || ""}`
    : ua.includes("Edg/")
      ? `Edge ${ua.split("Edg/")[1]?.split(" ")[0] || ""}`
      : ua.includes("Chrome/")
        ? `Chrome ${ua.split("Chrome/")[1]?.split(" ")[0] || ""}`
        : ua.includes("Safari/") && !ua.includes("Chrome")
          ? `Safari ${ua.split("Version/")[1]?.split(" ")[0] || ""}`
          : ua.includes("OPR/") || ua.includes("Opera/")
            ? "Opera"
            : "Web Browser";

  const isMobile = ua.includes("iPhone") || ua.includes("Android");
  const isTablet = ua.includes("iPad");
  const deviceType = isMobile
    ? ("mobile" as const)
    : isTablet
      ? ("tablet" as const)
      : ("desktop" as const);

  const platform = ua.includes("iPhone")
    ? "iOS"
    : ua.includes("iPad")
      ? "iPadOS"
      : ua.includes("Android")
        ? "Android"
        : ua.includes("Macintosh") || ua.includes("Mac OS X")
          ? "macOS"
          : ua.includes("Windows")
            ? "Windows"
            : ua.includes("Linux")
              ? "Linux"
              : "Unknown OS";

  const device = ua.includes("iPhone")
    ? "iPhone"
    : ua.includes("iPad")
      ? "iPad"
      : ua.includes("Android")
        ? "Android Device"
        : ua.includes("Macintosh")
          ? "Mac"
          : ua.includes("Windows")
            ? "Windows PC"
            : ua.includes("Linux")
              ? "Linux PC"
              : "Computer";

  return { device, browser: browser.trim(), platform, deviceType };
}

export function getSessionStatus(session: Session): "ACTIVE" | "REVOKED" | "EXPIRED" {
  if (session.revokedAt) return "REVOKED";
  if (new Date(session.expiresAt).getTime() < Date.now()) return "EXPIRED";
  return "ACTIVE";
}

export function getSessionColumns(options?: SessionOptions): ColumnDef<Session>[] {
  const { onRevoke, onDelete, currentSessionId } = options ?? {};

  return [
    {
      id: "device",
      accessorFn: (row) => {
        const { device, browser, platform } = parseUserAgent(row.userAgent);
        return `${device} ${browser} ${platform}`;
      },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Device & Client" />,
      cell: ({ row }) => {
        const { device, browser, platform, deviceType } = parseUserAgent(row.original.userAgent);
        const Icon =
          deviceType === "mobile"
            ? Phone
            : deviceType === "tablet"
              ? Tablet
              : deviceType === "server"
                ? Terminal
                : Laptop;

        return (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-default-900 truncate leading-tight">
                {device}
              </div>
              <div className="text-xs text-default-400 truncate mt-0.5">
                {browser} · {platform}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "ipAddress",
      header: ({ column }) => <DataTableColumnHeader column={column} title="IP Address" />,
      cell: ({ row }) => (
        <span className="font-mono text-sm font-medium text-default-800">
          {formatIpAddress(row.original.ipAddress)}
        </span>
      ),
    },
    {
      id: "location",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Location" />,
      cell: ({ row }) => {
        const displayIp = formatIpAddress(row.original.ipAddress);
        const isLocal = displayIp === "127.0.0.1" || row.original.ipAddress === "::1";
        return isLocal ? (
          <span className="inline-flex items-center gap-1.5 text-sm text-default-500 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-default-400" />
            Localhost
          </span>
        ) : (
          <span className="text-sm text-default-300">—</span>
        );
      },
    },
    {
      id: "status",
      accessorFn: (row) => getSessionStatus(row),
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => {
        const isCurrent = Boolean(currentSessionId && row.original.id === currentSessionId);
        const status = getSessionStatus(row.original);

        if (isCurrent || status === "ACTIVE") {
          return (
            <Badge color="success" variant="soft" className="gap-1.5 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              Active
            </Badge>
          );
        }

        if (status === "REVOKED") {
          return (
            <Badge color="destructive" variant="soft" className="font-medium">
              Revoked
            </Badge>
          );
        }

        return (
          <Badge color="secondary" variant="soft" className="font-medium">
            Expired
          </Badge>
        );
      },
      filterFn: (row, id, value: string[]) => value.includes(row.getValue(id)),
    },
    {
      accessorKey: "lastSeenAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Last Activity" />,
      cell: ({ row }) => (
        <div className="text-sm text-default-600 tabular-nums">
          {formatRelativeTime({ date: row.original.lastSeenAt })}
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Signed In At" />,
      cell: ({ row }) => (
        <div className="text-sm text-default-600 tabular-nums">
          {formatDateTime({ date: row.original.createdAt })}
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const item = row.original;
        const status = getSessionStatus(item);

        const handleAction = () => {
          const isRevokedOrExpired = status === "REVOKED" || status === "EXPIRED";
          if (isRevokedOrExpired && onDelete) {
            onDelete(item);
          } else if (onRevoke) {
            onRevoke(item);
          } else if (onDelete) {
            onDelete(item);
          }
        };

        return (
          <div className="flex justify-end pr-1">
            <Button
              variant="ghost"
              size="icon"
              color="destructive"
              onClick={handleAction}
              className="h-8 w-8 rounded-md text-destructive/50 hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];
}
