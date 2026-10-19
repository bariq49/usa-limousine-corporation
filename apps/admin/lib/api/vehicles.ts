import { http } from "../http/client";
import API_ROUTES from "./routes";
import type { Item, ListResponse, Query } from "../types/vehicles";

export const getVehicles = (params?: Query) => {
  return http.get<ListResponse>(API_ROUTES.VEHICLES, { params });
};

export const getVehicle = (id: string) => {
  return http.get<Item>(`${API_ROUTES.VEHICLES}/${id}`);
};

export const deleteVehicle = (id: string) => {
  return http.delete(`${API_ROUTES.VEHICLES}/${id}`);
};

export const bulkDeleteVehicles = (ids: string[]) => {
  return http.delete(`${API_ROUTES.VEHICLES}/bulk`, { data: { ids } });
};
