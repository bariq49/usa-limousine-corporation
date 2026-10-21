import { http } from "../http/client";
import API_ROUTES from "./routes";
import type { BookingAnalytics } from "./types";

export const getBookingAnalytics = (year: number) => {
  return http.get<BookingAnalytics>(`${API_ROUTES.BOOKINGS}/analytics`, { params: { year } });
};
