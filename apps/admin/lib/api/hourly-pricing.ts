import { http } from "../http/client";
import API_ROUTES from "./routes";
import type { CreatePayload, Item, List, Query, UpdatePayload } from "../types/hourly-pricing";

export const getHourlyPricings = (params?: Query) => {
  return http.get<List>(API_ROUTES.HOURLY_PRICING, {
    params,
  });
};

export const getHourlyPricing = (id: string) => {
  return http.get<Item>(`${API_ROUTES.HOURLY_PRICING}/${id}`);
};

export const createHourlyPricing = (payload: CreatePayload) => {
  return http.post<Item>(API_ROUTES.HOURLY_PRICING, payload);
};

export const updateHourlyPricing = (id: string, payload: UpdatePayload) => {
  return http.patch<Item>(`${API_ROUTES.HOURLY_PRICING}/${id}`, payload);
};

export const deleteHourlyPricing = (id: string) => {
  return http.delete(`${API_ROUTES.HOURLY_PRICING}/${id}`);
};

export const bulkDeleteHourlyPricings = (ids: string[]) => {
  return http.delete(`${API_ROUTES.HOURLY_PRICING}/bulk`, {
    data: { ids },
  });
};
