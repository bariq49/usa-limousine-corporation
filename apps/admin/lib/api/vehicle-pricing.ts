import { http } from "../http/client";
import API_ROUTES from "./routes";
import type { CreatePayload, Item, List, Query, UpdatePayload } from "../types/vehicle-pricing";

export const getVehiclePricings = (params?: Query) => {
  return http.get<List>(API_ROUTES.VEHICLE_CATEGORY_PRICING, {
    params,
  });
};

export const createVehiclePricing = (payload: CreatePayload) => {
  return http.post<Item>(API_ROUTES.VEHICLE_CATEGORY_PRICING, payload);
};

export const updateVehiclePricing = (id: string, payload: UpdatePayload) => {
  return http.patch<Item>(`${API_ROUTES.VEHICLE_CATEGORY_PRICING}/${id}`, payload);
};

export const deleteVehiclePricing = (id: string) => {
  return http.delete(`${API_ROUTES.VEHICLE_CATEGORY_PRICING}/${id}`);
};

export const bulkDeleteVehiclePricings = (ids: string[]) => {
  return http.delete(`${API_ROUTES.VEHICLE_CATEGORY_PRICING}/bulk`, {
    data: { ids },
  });
};
