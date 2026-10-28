import API_ROUTES from "@/config/routes";
import { api } from "./client";
import type { VehicleCategory } from "@/types/vehicle-category.types";

export const getCategories = async (): Promise<VehicleCategory[]> => {
  const response = await api.get(API_ROUTES.VEHICLE_CATEGORIES, { params: { limit: 100 } });
  return response.data?.data ?? [];
};
