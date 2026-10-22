import type { BookingStatus, BookingType } from "./bookings";
import type { TicketCategory, TicketStatus } from "./tickets";

export type CustomerType = "NORMAL" | "VIP" | "CORPORATE";

export type CustomerUser = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  _count: { bookings: number };
};

export type Customer = {
  id: string;
  userId: string;
  type: CustomerType;
  createdAt: string;
  updatedAt: string;
  user: CustomerUser;
  _count: { helpTickets: number };
};

export type CustomerDetail = Customer & {
  settings?: { email: boolean; notification: boolean } | null;
  user: CustomerUser & {
    bookings: {
      id: string;
      bookingNumber: string;
      status: BookingStatus;
      bookingType: BookingType;
      totalPrice: number;
      currency: string;
      createdAt: string;
    }[];
  };
  helpTickets: {
    id: string;
    ticketNumber: string;
    subject: string;
    status: TicketStatus;
    category: TicketCategory;
    createdAt: string;
  }[];
};

export type CustomerQuery = {
  page?: number | undefined;
  limit?: number | undefined;
  search?: string | undefined;
  type?: CustomerType | undefined;
};

export type CustomerListResponse = {
  data: Customer[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};
