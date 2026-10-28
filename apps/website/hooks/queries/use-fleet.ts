import { getCategories } from "@/lib/api/fleets";
import { useQuery } from "@tanstack/react-query";

export const useCategories = (enabled: boolean) => {
  return useQuery({
    queryKey: ["vehicle-categories"],
    queryFn: getCategories,
    enabled,
  });
};
