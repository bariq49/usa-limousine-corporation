import { HelpTicketStatus, NotificationType } from "@prisma/client";
import type { Notify, Reply, StatusUpdated } from "../types/ticket.events";

export function replyNotify(payload: Reply): Notify {
  return {
    type: NotificationType.TICKET_REPLY,
    title: "Help ticket reply",
    body: `Support replied to ticket ${payload.ticketNumber}`,
    data: {
      type: "TICKET_REPLY",
      payload: {
        ticketId: payload.ticketId,
        ticketNumber: payload.ticketNumber,
        subject: payload.subject,
        messageId: payload.messageId,
      },
    },
    push: true,
  };
}

export function statusNotify(payload: StatusUpdated): Notify {
  if (payload.to === HelpTicketStatus.RESOLVED) {
    return {
      type: NotificationType.TICKET_RESOLVED,
      title: "Help ticket resolved",
      body: `Ticket ${payload.ticketNumber} has been resolved`,
      data: {
        type: "TICKET_RESOLVED",
        payload: {
          ticketId: payload.ticketId,
          ticketNumber: payload.ticketNumber,
          subject: payload.subject,
          status: payload.to,
        },
      },
      push: true,
    };
  }

  return {
    type: NotificationType.TICKET_STATUS_UPDATED,
    title: "Help ticket updated",
    body: `Ticket ${payload.ticketNumber} is now ${payload.to.toLowerCase().replace(/_/g, " ")}`,
    data: {
      type: "TICKET_STATUS_UPDATED",
      payload: {
        ticketId: payload.ticketId,
        ticketNumber: payload.ticketNumber,
        subject: payload.subject,
        from: payload.from,
        to: payload.to,
      },
    },
    push: false,
  };
}
