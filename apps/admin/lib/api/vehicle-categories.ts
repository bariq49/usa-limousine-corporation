import { http } from "../http/client";
import API_ROUTES from "./routes";
import type {
  CreatePayload,
  Item,
  ListResponse,
  Query,
  UpdatePayload,
} from "../types/vehicle-categories";

export const getCategories = (params?: Query) => {
  return http.get<ListResponse>(API_ROUTES.VEHICLE_CATEGORIES, { params });
};

export const getCategory = (id: string) => {
  return http.get<Item>(`${API_ROUTES.VEHICLE_CATEGORIES}/${id}`);
};

export const createCategory = (payload: CreatePayload) => {
  return http.post<Item>(API_ROUTES.VEHICLE_CATEGORIES, payload);
};

export const updateCategory = (id: string, payload: UpdatePayload) => {
  return http.patch<Item>(`${API_ROUTES.VEHICLE_CATEGORIES}/${id}`, payload);
};

export const deleteCategory = (id: string) => {
  return http.delete(`${API_ROUTES.VEHICLE_CATEGORIES}/${id}`);
};

export const bulkDeleteCategories = (ids: string[]) => {
  return http.delete(`${API_ROUTES.VEHICLE_CATEGORIES}/bulk`, { data: { ids } });
};
