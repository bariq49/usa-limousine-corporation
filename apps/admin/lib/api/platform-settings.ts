import { http } from "../http/client";
import API_ROUTES from "./routes";
import type { PlatformSettings, UpdatePayload } from "../types/platform-settings";

export const getPlatformSettings = () => {
  return http.get<PlatformSettings>(API_ROUTES.PLATFORM_SETTINGS);
};

export const updatePlatformSettings = (payload: UpdatePayload) => {
  return http.patch<PlatformSettings>(API_ROUTES.PLATFORM_SETTINGS, payload);
};
