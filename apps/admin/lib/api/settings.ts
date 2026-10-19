import { http } from "../http/client";
import API_ROUTES from "./routes";
import type { Get, Update } from "../types/settings";

export const getPlatformSettings = () => {
  return http.get<Get>(API_ROUTES.SETTINGS);
};

export const updatePlatformSettings = (payload: Update) => {
  return http.patch<Get>(API_ROUTES.SETTINGS, payload);
};
