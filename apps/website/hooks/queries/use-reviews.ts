import { useQuery } from "@tanstack/react-query";
import { getReviewSummary } from "@/lib/api/reviews";

export const useReviews = () => {
  return useQuery({
    queryKey: ["reviews"],
    queryFn: getReviewSummary,
    staleTime: 60 * 60 * 1000,
  });
};
