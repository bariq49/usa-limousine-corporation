import type {
  HelpTicketCategory,
  HelpTicketPriority,
  HelpTicketSource,
  HelpTicketStatus,
} from "@prisma/client";

export type Create = {
  customerId: string;
  subject: string;
  description: string;
  attachment?: string | undefined;
  category?: HelpTicketCategory | undefined;
  priority?: HelpTicketPriority | undefined;
};

export type WebsiteCreate = {
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  description: string;
  category: HelpTicketCategory;
  priority: HelpTicketPriority;
};

export type CreateData = {
  ticketNumber: string;
  customerId: string | null;
  source: HelpTicketSource;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  subject: string;
  description: string;
  attachment: string | null;
  category: HelpTicketCategory;
  priority: HelpTicketPriority;
  actorUserId: string | null;
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
