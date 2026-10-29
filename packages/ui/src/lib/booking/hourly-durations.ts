import { BOOKING_API_ROUTES } from "../../constants/booking";
import { bookingApi } from "./client";

export const getHourlyDurations = async (): Promise<number[]> => {
  const response = await bookingApi.get(BOOKING_API_ROUTES.HOURLY_DURATIONS);
  return response.data ?? [];
};
