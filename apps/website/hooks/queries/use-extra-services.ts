import { getExtraServices } from "@/lib/api/extra-services";
import { useQuery } from "@tanstack/react-query";

export const useExtraServices = () => {
  return useQuery({
    queryKey: ["extra-services"],
    queryFn: getExtraServices,
    staleTime: 10 * 60 * 1000,
  });
};
