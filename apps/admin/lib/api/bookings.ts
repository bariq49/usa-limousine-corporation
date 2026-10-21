import { http } from "../http/client";
import API_ROUTES from "./routes";
import type { Item, ListResponse, Query } from "../types/bookings";

export const getBookings = (params?: Query) => {
  return http.get<ListResponse>(API_ROUTES.BOOKINGS, { params });
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
