import type {
  HelpTicketCategory,
  HelpTicketOwnerType,
  HelpTicketPriority,
  HelpTicketStatus,
} from "@prisma/client";

export type Create = {
  ownerType: HelpTicketOwnerType;
  ownerId: string;
  ownerName?: string | null | undefined;
  ownerEmail?: string | null | undefined;
  subject: string;
  description: string;
  attachment?: string | undefined;
  category?: HelpTicketCategory | undefined;
  priority?: HelpTicketPriority | undefined;
};

export type CreateData = {
  ticketNumber: string;
  ownerType: HelpTicketOwnerType;
  ownerId: string;
  ownerName: string | null;
  ownerEmail: string | null;
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
