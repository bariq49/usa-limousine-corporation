import API_ROUTES from "@/config/routes";
import { api } from "./client";
import type { LuggageType } from "@/types/extra-service.types";

export const getLuggageTypes = async (): Promise<LuggageType[]> => {
  const response = await api.get(API_ROUTES.LUGGAGE, { params: { limit: 100 } });
  return response.data?.data ?? [];
};
