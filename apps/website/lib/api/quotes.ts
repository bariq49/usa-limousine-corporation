import API_ROUTES from "@/config/routes";
import { api } from "./client";
import type { Quote, QuoteEstimate, QuoteRequest } from "@/types/booking.types";

export const getEstimates = async (request: QuoteRequest): Promise<QuoteEstimate[]> => {
  const response = await api.post(API_ROUTES.QUOTE_ESTIMATES, request);
  return response.data ?? [];
};

export const createQuote = async (request: QuoteRequest): Promise<Quote> => {
  const response = await api.post(API_ROUTES.QUOTES, request);
  return response.data;
};
