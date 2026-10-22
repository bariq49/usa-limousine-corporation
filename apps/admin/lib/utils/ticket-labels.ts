import type { TicketCategory, TicketPriority, TicketStatus, Ticket } from "@/lib/types/tickets";

export const STATUS_LABELS: Record<TicketStatus, string> = {
  PENDING: "Pending",
  OPEN: "Open",
  IN_PROGRESS: "In progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

export const STATUS_STEPS: TicketStatus[] = [
  "PENDING",
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
];

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

export const PRIORITY_OPTIONS = (Object.keys(PRIORITY_LABELS) as TicketPriority[]).map((value) => ({
  value,
  label: PRIORITY_LABELS[value],
}));

export const CATEGORY_LABELS: Record<TicketCategory, string> = {
  ACCOUNT: "Account",
  BOOKING: "Booking",
  PAYMENTS: "Payments",
  APP: "App",
  OTHER: "Other",
};

export const REOPEN_STATUS: TicketStatus = "IN_PROGRESS";

/** Next forward stage. Closed has none. */
export function forwardStatus(current: TicketStatus): TicketStatus | null {
  switch (current) {
    case "PENDING":
      return "OPEN";
    case "OPEN":
      return "IN_PROGRESS";
    case "IN_PROGRESS":
      return "RESOLVED";
    case "RESOLVED":
      return "CLOSED";
    default:
      return null;
  }
}

export function canReopen(current: TicketStatus): boolean {
  return current === "RESOLVED";
}

/** Allowed API transitions from the current status. */
export function nextStatuses(current: TicketStatus): TicketStatus[] {
  if (current === "RESOLVED") return ["CLOSED", REOPEN_STATUS];
  const next = forwardStatus(current);
  return next ? [next] : [];
}

export function statusActionLabel(target: TicketStatus): string {
  switch (target) {
    case "OPEN":
      return "Open ticket";
    case "IN_PROGRESS":
      return "Start work";
    case "RESOLVED":
      return "Mark resolved";
    case "CLOSED":
      return "Close ticket";
    default:
      return "Update status";
  }
}

export function formatCategory(value?: string | null) {
  if (!value) return "—";
  return CATEGORY_LABELS[value as TicketCategory] ?? value.replaceAll("_", " ").toLowerCase();
}

export function statusBadgeColor(status: TicketStatus) {
  switch (status) {
    case "RESOLVED":
      return "success" as const;
    case "CLOSED":
      return "secondary" as const;
    case "IN_PROGRESS":
      return "default" as const;
    case "OPEN":
      return "info" as const;
    default:
      return "warning" as const;
  }
}

export function priorityBadgeColor(priority: TicketPriority) {
  switch (priority) {
    case "HIGH":
      return "destructive" as const;
    case "MEDIUM":
      return "warning" as const;
    default:
      return "secondary" as const;
  }
}

/** Owner display name and email, from the linked customer account. */
export function ticketOwner(ticket: Pick<Ticket, "customer">) {
  const user = ticket.customer?.user;
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim();
  return { name: name || "—", email: user?.email || "—" };
}
