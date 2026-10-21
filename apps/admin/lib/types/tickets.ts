export type TicketStatus = "PENDING" | "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export type TicketPriority = "LOW" | "MEDIUM" | "HIGH";

export type TicketCategory =
  | "ACCOUNT"
  | "PAYMENTS"
  | "TRIPS"
  | "VEHICLE"
  | "DOCUMENTS"
  | "APP"
  | "PASSENGER_NO_SHOW"
  | "FLAT_TIRE"
  | "OTHER";

export type OwnerType = "CUSTOMER";

export type Author = {
  id: string;
  email: string;
};

export type Message = {
  id: string;
  ticketId: string;
  authorUserId: string;
  body: string;
  createdAt: string;
  author?: Author;
};

export type Event = {
  id: string;
  ticketId: string;
  event: string;
  actorUserId: string;
  previousStatus?: TicketStatus | null;
  newStatus?: TicketStatus | null;
  previousPriority?: TicketPriority | null;
  newPriority?: TicketPriority | null;
  note?: string | null;
  createdAt: string;
  actor?: Author;
};

export type Ticket = {
  id: string;
  ticketNumber: string;
  ownerType: OwnerType;
  ownerId: string;
  ownerName?: string | null;
  ownerEmail?: string | null;
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
  ownerType?: OwnerType | undefined;
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
