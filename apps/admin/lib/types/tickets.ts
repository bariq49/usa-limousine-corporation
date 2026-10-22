export type TicketStatus = "PENDING" | "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export type TicketPriority = "LOW" | "MEDIUM" | "HIGH";

export type TicketCategory = "ACCOUNT" | "BOOKING" | "PAYMENTS" | "APP" | "OTHER";

/** Ticket owner; name/email/phone are read live from the customer's user. */
export type TicketCustomer = {
  id: string;
  type: string;
  user: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    email: string;
    phone?: string | null;
  };
};

export type Author = {
  id: string;
  email: string;
};

export type Message = {
  id: string;
  ticketId: string;
  authorUserId: string | null;
  body: string;
  createdAt: string;
  author?: Author | null;
};

export type Event = {
  id: string;
  ticketId: string;
  event: string;
  actorUserId: string | null;
  previousStatus?: TicketStatus | null;
  newStatus?: TicketStatus | null;
  previousPriority?: TicketPriority | null;
  newPriority?: TicketPriority | null;
  note?: string | null;
  createdAt: string;
  actor?: Author | null;
};

export type Ticket = {
  id: string;
  ticketNumber: string;
  customerId: string;
  customer?: TicketCustomer | null;
  subject: string;
  description: string;
  attachment?: string | null;
  category: TicketCategory;
  status: TicketStatus;
  priority: TicketPriority;
  resolvedAt?: string | null;
  closedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  messages?: Message[];
  events?: Event[];
};

export type Query = {
  page?: number | undefined;
  limit?: number | undefined;
  search?: string | undefined;
  status?: TicketStatus | undefined;
  category?: TicketCategory | undefined;
  priority?: TicketPriority | undefined;
  customerId?: string | undefined;
  sortBy?: string | undefined;
  sortOrder?: "asc" | "desc" | undefined;
};

export type ListResponse = {
  data: Ticket[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type StatusPayload = {
  status: TicketStatus;
  note?: string;
};

export type PriorityPayload = {
  priority: TicketPriority;
};

export type ReplyPayload = {
  body: string;
};
