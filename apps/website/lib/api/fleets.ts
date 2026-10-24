import API_ROUTES from "@/config/routes";
import { api } from "./client";
import type { ByDistanceParams, VehicleCategory } from "@/types/vehicle-category.types";

/** Vehicles priced for the trip distance (miles), with the fee breakdown. */
export const getCategoriesByDistance = async (params: ByDistanceParams): Promise<VehicleCategory[]> => {
  const response = await api.get(API_ROUTES.VEHICLE_PRICING, {
    params: {
      distance: Math.round(params.distance * 100) / 100,
      isAirport: Boolean(params.isAirport),
    },
  });
  return response.data ?? [];
};

export const getCategories = async (): Promise<VehicleCategory[]> => {
  const response = await api.get(API_ROUTES.VEHICLE_CATEGORIES, { params: { limit: 100 } });
  return response.data?.data ?? [];
};
