import type { BookingStatus } from "@prisma/client";

export type CheckoutBooking = {
  id: string;
  status: BookingStatus;
  bookingNumber: string;
  userId: string | null;
  passenger: { name: string; email: string; phone: string };
};

export type SquareWebhookEvent = {
  type?: string;
  data?: { object?: { payment?: { order_id?: string } } };
};
