import type { HelpTicketStatus } from "@prisma/client";

export type TicketRef = {
  id: string;
  ticketNumber: string;
  subject: string;
  customerId: string | null;
  userId: string | null;
};

export type TicketNotifyCreated = {
  ticket: TicketRef;
  actorUserId?: string | null | undefined;
};

export type TicketNotifyWebsiteCreated = {
  ticket: TicketRef;
  contactName: string;
  isHigh?: boolean | undefined;
};

export type TicketNotifyStaffReply = {
  ticket: TicketRef;
  messageId: string;
};

export type TicketNotifyCustomerReply = {
  ticket: Pick<TicketRef, "id" | "ticketNumber">;
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
