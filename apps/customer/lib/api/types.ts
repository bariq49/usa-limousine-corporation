import type { NotificationItem } from "@usa-limousine-corporation/ui/providers/notification-context";
import type { RoleKey } from "@usa-limousine-corporation/ui/types/navigation";

export type AuthTokens = {
  accessToken: string;
  sessionId: string;
};

export type CsrfResponse = {
  csrfToken: string;
};

export type CurrentUserMembership = {
  id: string;
  membershipStatus: string;
  organization: {
    id: string;
    name: string;
    slug: string;
    status: string;
  };
};

export type CurrentUser = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  roles: RoleKey[];
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  memberSince?: string;
  sessionId: string;
  memberships: CurrentUserMembership[];
};

export type MessageResponse = {
  message: string;
};

export type UploadResponse = {
  publicId: string;
  url: string;
  secureUrl: string;
  resourceType: string;
  format: string;
  bytes: number;
  width?: number;
  height?: number;
};

export type UploadFileOptions = {
  file: File;
  folder?: string;
};

export type SessionApiItem = {
  id: string;
  deviceId: string;
  ipAddress: string | null;
  userAgent: string | null;
  expiresAt: string;
  revokedAt?: string | null;
  lastSeenAt: string;
  createdAt: string;
};

export type NotificationList = {
  items: NotificationItem[];
  /** Pass as `cursor` to load the next page; null on the last page. */
  nextCursor: string | null;
  hasNextPage: boolean;
  unreadCount: number;
};

/** Response of GET /customers/bookings/analytics (the customer's own bookings, one year). */
export type BookingAnalytics = {
  year: number;
  month: number | null;
  totalBookings: number;
  /** Amount of completed bookings. */
  totalRevenue: number;
  completedBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  monthlyRevenue: number[];
  monthlyBookings: {
    completed: number[];
    confirmed: number[];
    pending: number[];
    cancelled: number[];
  };
};

export type CustomerSettings = {
  email: boolean;
  /** In-app (dashboard bell) notifications. */
  notification: boolean;
  sms: boolean;
};

export type UpdateCustomerSettings = {
  email?: boolean | undefined;
  notification?: boolean | undefined;
  sms?: boolean | undefined;
};

export type TicketStatus = "PENDING" | "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
export type TicketPriority = "LOW" | "MEDIUM" | "HIGH";
export type TicketCategory = "ACCOUNT" | "BOOKING" | "PAYMENTS" | "APP" | "OTHER";

export type TicketMessage = {
  id: string;
  body: string;
  createdAt: string;
  authorUserId: string | null;
  author?: { id: string; email: string } | null;
};

export type TicketEvent = {
  id: string;
  event: string;
  actorUserId: string | null;
  previousStatus?: TicketStatus | null;
  newStatus?: TicketStatus | null;
  previousPriority?: TicketPriority | null;
  newPriority?: TicketPriority | null;
  note?: string | null;
  createdAt: string;
};

export type Ticket = {
  id: string;
  ticketNumber: string;
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
  messages?: TicketMessage[];
  events?: TicketEvent[];
};

export type TicketList = {
  data: Ticket[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type CreateTicket = {
  subject: string;
  description: string;
  category?: TicketCategory | undefined;
  priority?: TicketPriority | undefined;
  attachment?: string | undefined;
};

export type TicketQuery = {
  page?: number | undefined;
  limit?: number | undefined;
  status?: TicketStatus | undefined;
  priority?: TicketPriority | undefined;
  category?: TicketCategory | undefined;
  search?: string | undefined;
};
