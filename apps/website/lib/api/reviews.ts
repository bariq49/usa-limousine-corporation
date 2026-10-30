import API_ROUTES from "@/config/routes";
import { api } from "./client";
import type { ReviewSummary } from "@/types/review.types";

export const getReviewSummary = async (): Promise<ReviewSummary> => {
  const response = await api.get(API_ROUTES.REVIEWS);
  return response.data;
};
