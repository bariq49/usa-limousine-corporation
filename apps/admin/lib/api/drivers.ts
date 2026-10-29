import { http } from "../http/client";
import API_ROUTES from "./routes";
import type {
  AssignPayload,
  Assignment,
  Driver,
  DriverBookingsQuery,
  DriverBookingsResponse,
  DriverListResponse,
  DriverPayload,
  DriverQuery,
  DriverStats,
  StatsPeriod,
} from "../types/drivers";

export const getDrivers = (params?: DriverQuery) => {
  return http.get<DriverListResponse>(API_ROUTES.DRIVERS, { params });
};

export const getDriver = (id: string) => {
  return http.get<Driver>(`${API_ROUTES.DRIVERS}/${id}`);
};

export const getDriverStats = (id: string, period: StatsPeriod) => {
  return http.get<DriverStats>(`${API_ROUTES.DRIVERS}/${id}/stats`, { params: { period } });
};

export const getDriverBookings = (id: string, params?: DriverBookingsQuery) => {
  return http.get<DriverBookingsResponse>(`${API_ROUTES.DRIVERS}/${id}/bookings`, { params });
};

export const createDriver = (payload: DriverPayload) => {
  return http.post<Driver>(API_ROUTES.DRIVERS, payload);
};

export const updateDriver = (id: string, payload: Partial<DriverPayload>) => {
  return http.patch<Driver>(`${API_ROUTES.DRIVERS}/${id}`, payload);
};

export const deleteDriver = (id: string) => {
  return http.delete(`${API_ROUTES.DRIVERS}/${id}`);
};

export const getAssignments = (bookingId: string) => {
  return http.get<Assignment[]>(`${API_ROUTES.BOOKINGS}/${bookingId}/assignments`);
};

export const assignDriver = (bookingId: string, payload: AssignPayload) => {
  return http.post<Assignment>(`${API_ROUTES.BOOKINGS}/${bookingId}/assignments`, payload);
};

export const unassignDriver = (bookingId: string) => {
  return http.delete(`${API_ROUTES.BOOKINGS}/${bookingId}/assignments`);
};
