export const TICKET_EVENT = {
  CREATED: "help_center.ticket_created",
  REPLIED: "help_center.ticket_replied",
  STATUS_UPDATED: "help_center.ticket_status_updated",
} as const;

export type TicketEventName = (typeof TICKET_EVENT)[keyof typeof TICKET_EVENT];
