import API_ROUTES from "@/config/routes";
import { api } from "./client";

export const getHourlyDurations = async (): Promise<number[]> => {
  const response = await api.get(API_ROUTES.HOURLY_DURATIONS);
  return response.data ?? [];
};
