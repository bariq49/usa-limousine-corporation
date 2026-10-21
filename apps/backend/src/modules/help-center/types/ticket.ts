import type { HelpTicketCategory, HelpTicketPriority, HelpTicketStatus } from "@prisma/client";

export type Create = {
  customerId: string;
  subject: string;
  description: string;
  attachment?: string | undefined;
  category?: HelpTicketCategory | undefined;
  priority?: HelpTicketPriority | undefined;
};

export type CreateData = {
  ticketNumber: string;
  customerId: string;
  subject: string;
  description: string;
  attachment: string | null;
  category: HelpTicketCategory;
  priority: HelpTicketPriority;
  actorUserId: string;
};

export type MessageData = {
  ticketId: string;
  authorUserId: string;
  body: string;
};

export type StatusData = {
  ticketId: string;
  status: HelpTicketStatus;
  actorUserId: string;
  note?: string | undefined;
};

export type PriorityData = {
  ticketId: string;
  priority: HelpTicketPriority;
  actorUserId: string;
};
