import { useQuery } from "@tanstack/react-query";
import { getVehicleCategories } from "@/lib/api/vehicle-categories";

export const useVehicleCategories = () => {
  return useQuery({
    queryKey: ["vehicle-categories"],
    queryFn: getVehicleCategories,
    staleTime: 10 * 60 * 1000,
  });
};
