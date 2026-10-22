import type { Item, ListResponse, Query } from "@usa-limousine-corporation/ui/bookings/types";
import { http } from "../http/client";
import API_ROUTES from "./routes";
import type { BookingAnalytics } from "./types";

export const getBookingAnalytics = (year: number) => {
  return http.get<BookingAnalytics>(`${API_ROUTES.BOOKINGS}/analytics`, { params: { year } });
};

export const getBookings = (params?: Query) => {
  return http.get<ListResponse>(API_ROUTES.BOOKINGS, { params });
};

export const getBooking = (id: string) => {
  return http.get<Item>(`${API_ROUTES.BOOKINGS}/${id}`);
};

export const cancelBooking = (id: string, cancellationReason?: string) => {
  return http.post<Item>(`${API_ROUTES.BOOKINGS}/${id}/cancel`, { cancellationReason });
};
