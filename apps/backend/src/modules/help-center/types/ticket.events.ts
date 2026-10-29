import type {
  HelpTicketCategory,
  HelpTicketPriority,
  HelpTicketStatus,
  NotificationType,
  Prisma,
} from "@prisma/client";

type Owner = {
  customerId: string | null;
  actorUserId: string | null;
};

export type Created = Owner & {
  ticketId: string;
  ticketNumber: string;
  subject: string;
  category: HelpTicketCategory;
  status: HelpTicketStatus;
  priority: HelpTicketPriority;
};

export type PriorityUpdated = Owner & {
  ticketId: string;
  ticketNumber: string;
  subject: string;
  from: HelpTicketPriority;
  to: HelpTicketPriority;
};

export type Reply = Owner & {
  ticketId: string;
  ticketNumber: string;
  subject: string;
  messageId: string;
  fromStaff: boolean;
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

export type TicketEmailKind = "created" | "replied" | "priority";

export type TicketEmailJob = {
  kind: TicketEmailKind;
  ticketId: string;
  messageId?: string | undefined;
};
