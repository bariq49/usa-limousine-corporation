import { getExtraServices, toChildSeats } from "@/lib/api/extra-services";
import { useQuery } from "@tanstack/react-query";

export const useChildSeats = () => {
  return useQuery({
    queryKey: ["extra-services"],
    queryFn: getExtraServices,
    select: toChildSeats,
  });
};
