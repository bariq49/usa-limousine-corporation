import { http } from "../http/client";
import API_ROUTES from "./routes";
import type { Item, ListResponse, Query } from "../types/bookings";
import type { BookingAnalytics } from "../types/dashboard";
import type { CalendarEvent, CalendarQuery } from "@usa-limousine-corporation/ui/types/booking-model";

export const getBookings = (params?: Query) => {
  return http.get<ListResponse>(API_ROUTES.BOOKINGS, { params });
};

export const getBookingAnalytics = (
  year: number,
  options?: { userId?: string | undefined; month?: number | null | undefined },
) => {
  const params: { year: number; userId?: string; month?: number } = { year };
  if (options?.userId) {
    params.userId = options.userId;
  }
  if (options?.month != null) {
    params.month = options.month;
  }
  return http.get<BookingAnalytics>(`${API_ROUTES.BOOKINGS}/analytics`, { params });
};

export const getBooking = (id: string) => {
  return http.get<Item>(`${API_ROUTES.BOOKINGS}/${id}`);
};

export const confirmBooking = (id: string) => {
  return http.post<Item>(`${API_ROUTES.BOOKINGS}/${id}/confirm`);
};

export const completeBooking = (id: string) => {
  return http.post<Item>(`${API_ROUTES.BOOKINGS}/${id}/complete`);
};

export const cancelBooking = (id: string, cancellationReason?: string) => {
  return http.post<Item>(`${API_ROUTES.BOOKINGS}/${id}/cancel`, { cancellationReason });
};

export const deleteBooking = (id: string) => {
  return http.delete(`${API_ROUTES.BOOKINGS}/${id}`);
};

export const bulkDeleteBookings = (ids: string[]) => {
  return http.delete(`${API_ROUTES.BOOKINGS}/bulk`, { data: { ids } });
};

/** Bookings as calendar events for an inclusive YYYY-MM-DD range. */
export const getBookingCalendar = (query: CalendarQuery) => {
  return http.get<CalendarEvent[]>(`${API_ROUTES.BOOKINGS}/calendar`, {
    params: {
      start: query.start,
      end: query.end,
      bookingType: query.bookingType?.join(","),
    },
  });
};
