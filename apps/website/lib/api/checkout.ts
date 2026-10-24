import API_ROUTES from "@/config/routes";
import { api } from "./client";
import type { Item as Booking } from "@usa-limousine-corporation/ui/bookings/types";
import type { BookingDraft, CheckoutStart } from "@/types/booking.types";

export const startCheckout = async (draft: BookingDraft): Promise<CheckoutStart> => {
  const response = await api.post(API_ROUTES.CHECKOUT, draft);
  return response.data;
};

export const getCheckoutBooking = async (sessionId: string): Promise<Booking> => {
  const response = await api.get(`${API_ROUTES.CHECKOUT}/${encodeURIComponent(sessionId)}`);
  return response.data;
};
