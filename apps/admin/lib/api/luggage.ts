import { http } from "../http/client";
import API_ROUTES from "./routes";
import type { CreatePayload, Item, ListResponse, Query, UpdatePayload } from "../types/luggage";

export const getLuggage = (params?: Query) => {
  return http.get<ListResponse>(API_ROUTES.LUGGAGE, { params });
};

export const getLuggageItem = (id: string) => {
  return http.get<Item>(`${API_ROUTES.LUGGAGE}/${id}`);
};

export const createStandardLuggage = (payload: CreatePayload) => {
  return http.post<Item>(`${API_ROUTES.LUGGAGE}/standard`, payload);
};

export const createSpecialLuggage = (payload: CreatePayload) => {
  return http.post<Item>(`${API_ROUTES.LUGGAGE}/special`, payload);
};

export const createLuggage = (payload: CreatePayload) => {
  const isSpecial = Boolean(payload.isSpecial);
  return isSpecial ? createSpecialLuggage(payload) : createStandardLuggage(payload);
};

export const updateLuggage = (id: string, payload: UpdatePayload) => {
  return http.patch<Item>(`${API_ROUTES.LUGGAGE}/${id}`, payload);
};

export const deleteLuggage = (id: string) => {
  return http.delete(`${API_ROUTES.LUGGAGE}/${id}`);
};

export const bulkDeleteLuggage = (ids: string[]) => {
  return http.delete(`${API_ROUTES.LUGGAGE}/bulk`, { data: { ids } });
};
