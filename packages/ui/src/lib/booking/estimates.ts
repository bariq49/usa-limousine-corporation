import { BOOKING_API_ROUTES } from "../../constants/booking";
import type { Estimate, EstimateRequest } from "../../types/booking";
import { bookingApi } from "./client";

export const getEstimates = async (request: EstimateRequest): Promise<Estimate[]> => {
  const response = await bookingApi.post(BOOKING_API_ROUTES.ESTIMATES, request);
  return response.data ?? [];
};
