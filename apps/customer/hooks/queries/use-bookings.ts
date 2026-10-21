import { useQuery } from "@tanstack/react-query";
import { getBookingAnalytics } from "@/lib/api/bookings";

export const bookingQueryKeys = {
  analytics: (year: number) => ["bookings", "analytics", year] as const,
};

export const useBookingAnalytics = (year: number) => {
  return useQuery({
    queryKey: bookingQueryKeys.analytics(year),
    queryFn: () => getBookingAnalytics(year),
  });
};
