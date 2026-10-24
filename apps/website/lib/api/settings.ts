import API_ROUTES from "@/config/routes";
import { api } from "./client";
import type { BookingSettings } from "@/types/settings.types";

export const getSettings = async (): Promise<BookingSettings> => {
  const response = await api.get(API_ROUTES.SETTINGS);
  return response.data ?? {};
};
