import { http } from "../http/client";
import API_ROUTES from "./routes";
import type { CustomerSettings, UpdateCustomerSettings } from "./types";

export const getSettings = () => {
  return http.get<CustomerSettings>(API_ROUTES.SETTINGS);
};

export const updateSettings = (payload: UpdateCustomerSettings) => {
  return http.patch<CustomerSettings>(API_ROUTES.SETTINGS, payload);
};
