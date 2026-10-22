import type { TicketEvent, TicketPriority, TicketStatus } from "@/lib/api/types";
import { PRIORITY_LABELS, STATUS_LABELS } from "@/lib/utils/ticket-labels";

export type TicketActivityItem = {
  id: string;
  at: string;
  title: string;
  description: string;
  color: string;
  meta?: string;
};

function statusLabel(value?: string | null) {
  if (!value) return "";
  return STATUS_LABELS[value as TicketStatus] ?? value.replaceAll("_", " ").toLowerCase();
}

function priorityLabel(value?: string | null) {
  if (!value) return "";
  return PRIORITY_LABELS[value as TicketPriority] ?? value.replaceAll("_", " ").toLowerCase();
}

/** Customers see "You" or "Support team", never staff emails. */
function actorLabel(event: TicketEvent, currentUserId?: string | null) {
  return event.actorUserId && event.actorUserId === currentUserId ? "You" : "Support team";
}

export function fromTicketEvent(
  event: TicketEvent,
  currentUserId?: string | null,
): TicketActivityItem {
  const actor = actorLabel(event, currentUserId);

  switch (event.event) {
    case "CREATED":
      return {
        id: event.id,
        at: event.createdAt,
        title: "Ticket Created",
        description: "Support ticket was created.",
        color: "bg-sky-500",
        meta: `By ${actor}`,
      };
    case "STATUS_CHANGED": {
      const from = statusLabel(event.previousStatus);
      const to = statusLabel(event.newStatus);
      return {
        id: event.id,
        at: event.createdAt,
        title: "Status Updated",
        description:
          from && to ? `Status changed from ${from} to ${to}.` : "Ticket status was updated.",
        color: "bg-amber-500",
        meta: event.note?.trim() ? `By ${actor} · Note: ${event.note.trim()}` : `By ${actor}`,
      };
    }
    case "PRIORITY_CHANGED": {
      const from = priorityLabel(event.previousPriority);
      const to = priorityLabel(event.newPriority);
      return {
        id: event.id,
        at: event.createdAt,
        title: "Priority Updated",
        description:
          from && to ? `Priority changed from ${from} to ${to}.` : "Ticket priority was updated.",
        color: "bg-violet-500",
        meta: `By ${actor}`,
      };
    }
    case "MESSAGE_ADDED":
      return {
        id: event.id,
        at: event.createdAt,
        title: "Reply Added",
        description: "A reply was added to the conversation.",
        color: "bg-emerald-500",
        meta: `By ${actor}`,
      };
    default:
      return {
        id: event.id,
        at: event.createdAt,
        title: "Activity",
        description: event.event.replaceAll("_", " ").toLowerCase(),
        color: "bg-default-400",
        meta: `By ${actor}`,
      };
  }
}

export function buildTicketActivity(
  events?: TicketEvent[] | null,
  currentUserId?: string | null,
): TicketActivityItem[] {
  return (events ?? []).map((event) => fromTicketEvent(event, currentUserId));
}
