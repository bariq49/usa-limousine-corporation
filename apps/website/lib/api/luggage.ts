import API_ROUTES from "@/config/routes";
import { api } from "./client";
import type { ApiPaginated } from "@/types/vehicle-category.types";
import type { LuggageType } from "@/types/extra-service.types";

export const getLuggageTypes = async (): Promise<LuggageType[]> => {
  const response = await api.get(API_ROUTES.LUGGAGE, { params: { limit: 100 } });
  const page: ApiPaginated<LuggageType> | undefined = response.data;
  return page?.data ?? [];
};
