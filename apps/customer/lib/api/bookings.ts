import type {
  CalendarEvent,
  CalendarQuery,
  CreateInput,
  Item,
  ListResponse,
  Query,
} from "@usa-limousine-corporation/ui/types/booking-model";
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

export const completeBooking = (id: string) => {
  return http.post<Item>(`${API_ROUTES.BOOKINGS}/${id}/complete`);
};

export const createBooking = (body: CreateInput) => {
  return http.post<Item>(API_ROUTES.BOOKINGS, body);
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
