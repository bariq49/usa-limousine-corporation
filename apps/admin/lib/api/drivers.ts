import { http } from "../http/client";
import API_ROUTES from "./routes";
import type {
  ActivityResponse,
  Driver,
  ListResponse,
  Params,
  Performance,
  Query,
  ReviewsResponse,
  Vehicle,
} from "../types/drivers";

export const getApplications = (params?: Query) => {
  return http.get<ListResponse>(API_ROUTES.DRIVERS, { params });
};

export const getOverview = (id: string) => {
  return http.get<Driver>(`${API_ROUTES.DRIVERS}/${id}`);
};

export const remove = (id: string) => {
  return http.delete(`${API_ROUTES.DRIVERS}/${id}`);
};

export const bulkDelete = (ids: string[]) => {
  return http.delete(`${API_ROUTES.DRIVERS}/bulk`, { data: { ids } });
};

export const getReviews = (id: string) => {
  return http.get<ReviewsResponse>(`${API_ROUTES.DRIVERS}/${id}/reviews`);
};

export const getVehicle = (id: string) => {
  return http.get<Vehicle>(`${API_ROUTES.DRIVERS}/${id}/vehicle`);
};

export const getActivity = (id: string) => {
  return http.get<ActivityResponse>(`${API_ROUTES.DRIVERS}/${id}/activity`);
};

export const getPerformance = (id: string, params: Params = {}) => {
  return http.get<Performance>(`${API_ROUTES.DRIVERS}/${id}/performance`, {
    params,
  });
};

export const approve = (id: string) => {
  return http.post(`${API_ROUTES.DRIVERS}/${id}/approve`);
};

export const reject = (id: string, reason: string) => {
  return http.post(`${API_ROUTES.DRIVERS}/${id}/reject`, { reason });
};

export const markUnderReview = (id: string) => {
  return http.post(`${API_ROUTES.DRIVERS}/${id}/under-review`);
};

export const suspend = (id: string) => {
  return http.post(`${API_ROUTES.DRIVERS}/${id}/suspend`);
};

export const unsuspend = (id: string) => {
  return http.post(`${API_ROUTES.DRIVERS}/${id}/unsuspend`);
};
