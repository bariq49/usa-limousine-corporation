import type { HelpTicketCategory, HelpTicketStatus, NotificationType, Prisma } from "@prisma/client";

type Owner = {
  customerId: string;
  actorUserId: string;
};

export type Created = Owner & {
  ticketId: string;
  ticketNumber: string;
  subject: string;
  category: HelpTicketCategory;
  status: HelpTicketStatus;
};

export type Reply = Owner & {
  ticketId: string;
  ticketNumber: string;
  subject: string;
  messageId: string;
};

export type StatusUpdated = Owner & {
  ticketId: string;
  ticketNumber: string;
  subject: string;
  from: HelpTicketStatus;
  to: HelpTicketStatus;
  note?: string | null;
};

export type Notify = {
  type: NotificationType;
  title: string;
  body: string;
  data: Prisma.InputJsonValue;
  push: boolean;
};
