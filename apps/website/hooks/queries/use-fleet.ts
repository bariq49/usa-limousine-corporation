import { getCategoriesByDistance, getCategoriesForHourly } from "@/lib/api/fleets";
import { useQuery } from "@tanstack/react-query";
import type { ByDistanceParams } from "@/types/vehicle-category.types";

export const useCategoriesByDistance = (params: ByDistanceParams) => {
  const { distance, isAirport = false, enabled = true } = params;

  return useQuery({
    queryKey: ["categories-by-distance", distance, isAirport],
    queryFn: () => getCategoriesByDistance(params),
    enabled,
  });
};

export const useCategoriesForHourly = (enabled: boolean) => {
  return useQuery({
    queryKey: ["categories-hourly"],
    queryFn: getCategoriesForHourly,
    enabled,
  });
};
