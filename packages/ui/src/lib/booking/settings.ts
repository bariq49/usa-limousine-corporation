import { BOOKING_API_ROUTES } from "../../constants/booking";
import type { Settings } from "../../types/booking";
import { bookingApi } from "./client";

export const getSettings = async (): Promise<Settings> => {
  const response = await bookingApi.get(BOOKING_API_ROUTES.SETTINGS);
  return response.data ?? {};
};
