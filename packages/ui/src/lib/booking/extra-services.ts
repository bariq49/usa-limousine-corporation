import { BOOKING_API_ROUTES } from "../../constants/booking";
import type { ExtraService } from "../../types/booking";
import { bookingApi } from "./client";

export const getExtraServices = async (): Promise<ExtraService[]> => {
  const response = await bookingApi.get(BOOKING_API_ROUTES.EXTRA_SERVICES);
  return response.data ?? [];
};
