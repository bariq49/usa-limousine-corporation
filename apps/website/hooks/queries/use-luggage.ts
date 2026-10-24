import { getLuggageTypes } from "@/lib/api/luggage";
import { useQuery } from "@tanstack/react-query";

export const useLuggageTypes = () => {
  return useQuery({
    queryKey: ["luggage-types"],
    queryFn: getLuggageTypes,
    staleTime: 10 * 60 * 1000,
  });
};
