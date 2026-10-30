import API_ROUTES from "@/config/routes";
import { api } from "./client";
import type { VehicleCategory } from "@/types/vehicle-category.types";

export const getVehicleCategories = async (): Promise<VehicleCategory[]> => {
  const response = await api.get(API_ROUTES.ALL_VEHICLE_CATEGORIES);
  return response.data;
};
