import type { TicketCategory, TicketPriority, TicketStatus } from "@/lib/api/types";

export const STATUS_LABELS: Record<TicketStatus, string> = {
  PENDING: "Pending",
  OPEN: "Open",
  IN_PROGRESS: "In progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

export const STATUS_COLORS: Record<
  TicketStatus,
  "warning" | "info" | "default" | "success" | "secondary"
> = {
  PENDING: "warning",
  OPEN: "info",
  IN_PROGRESS: "default",
  RESOLVED: "success",
  CLOSED: "secondary",
};

export const CATEGORY_OPTIONS: { value: TicketCategory; label: string }[] = [
  { value: "BOOKING", label: "Booking" },
  { value: "PAYMENTS", label: "Payments" },
  { value: "ACCOUNT", label: "Account" },
  { value: "APP", label: "App" },
  { value: "OTHER", label: "Other" },
];

export const CATEGORY_LABELS = Object.fromEntries(
  CATEGORY_OPTIONS.map((option) => [option.value, option.label]),
) as Record<TicketCategory, string>;

export function canReply(status: TicketStatus) {
  return status !== "RESOLVED" && status !== "CLOSED";
}

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

export const PRIORITY_COLORS: Record<TicketPriority, "secondary" | "warning" | "destructive"> = {
  LOW: "secondary",
  MEDIUM: "warning",
  HIGH: "destructive",
};
