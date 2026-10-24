import type { BookingStatus } from "@prisma/client";

export type CheckoutBooking = {
  id: string;
  status: BookingStatus;
  bookingNumber: string;
  passenger: { name: string; email: string; phone: string };
};
