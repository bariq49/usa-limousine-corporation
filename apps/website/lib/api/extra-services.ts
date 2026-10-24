import API_ROUTES from "@/config/routes";
import { api } from "./client";
import type { ExtraService } from "@/types/extra-service.types";

export const getExtraServices = async (): Promise<ExtraService[]> => {
  const response = await api.get(API_ROUTES.EXTRA_SERVICES);
  return response.data ?? [];
};
