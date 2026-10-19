import { http } from "../http/client";
import API_ROUTES from "./routes";
import type { CreatePayload, Item, ListResponse, Query, UpdatePayload } from "../types/services";

export const getServices = (params?: Query) => {
  return http.get<ListResponse>(API_ROUTES.EXTRA_SERVICES, { params });
};

export const getServiceItem = (id: string) => {
  return http.get<Item>(`${API_ROUTES.EXTRA_SERVICES}/${id}`);
};

export const createService = (payload: CreatePayload) => {
  return http.post<Item>(API_ROUTES.EXTRA_SERVICES, payload);
};

export const updateService = (id: string, payload: UpdatePayload) => {
  return http.patch<Item>(`${API_ROUTES.EXTRA_SERVICES}/${id}`, payload);
};

export const deleteService = (id: string) => {
  return http.delete(`${API_ROUTES.EXTRA_SERVICES}/${id}`);
};

export const bulkDeleteServices = (ids: string[]) => {
  return http.delete(`${API_ROUTES.EXTRA_SERVICES}/bulk`, { data: { ids } });
};
