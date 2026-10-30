import type { HelpTicketStatus } from "@prisma/client";

export type TicketRef = {
  id: string;
  ticketNumber: string;
  subject: string;
  customerId: string | null;
};

export type TicketNotifyCreated = {
  ticket: TicketRef;
  actorUserId?: string | null | undefined;
};

export type TicketNotifyWebsiteCreated = {
  ticket: TicketRef;
  contactName: string;
  userId?: string | null | undefined;
  isHigh?: boolean | undefined;
};

export type TicketNotifyStaffReply = {
  ticket: TicketRef;
  messageId: string;
};

export type TicketNotifyCustomerReply = {
  ticket: Pick<TicketRef, "id" | "ticketNumber" | "customerId">;
  messageId: string;
  body: string;
  actorUserId?: string | null | undefined;
};

export type TicketNotifyStatusUpdated = {
  ticket: TicketRef;
  from: HelpTicketStatus;
  to: HelpTicketStatus;
  updatedAt: Date;
};
