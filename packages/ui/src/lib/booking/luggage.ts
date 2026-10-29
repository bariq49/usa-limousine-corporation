import { BOOKING_API_ROUTES } from "../../constants/booking";
import type { LuggageType } from "../../types/booking";
import { bookingApi } from "./client";

export const getLuggageTypes = async (vehicleCategoryId: string): Promise<LuggageType[]> => {
  const response = await bookingApi.get(`${BOOKING_API_ROUTES.VEHICLE_CATEGORIES}/${vehicleCategoryId}/luggage`);
  return response.data ?? [];
};
