import { getCheckoutBooking } from "@/lib/api/checkout";
import { useQuery } from "@tanstack/react-query";

const MAX_POLLS = 20;
const POLL_INTERVAL_MS = 3000;

export const useCheckoutBooking = (orderId: string | null | undefined, waitForResult = false) => {
  return useQuery({
    queryKey: ["checkout-booking", orderId],
    queryFn: () => getCheckoutBooking(orderId as string),
    enabled: Boolean(orderId),
    retry: 2,
    refetchInterval: (query) => {
      if (!waitForResult) return false;
      const settled = query.state.data?.status !== "PENDING";
      return settled || query.state.dataUpdateCount >= MAX_POLLS ? false : POLL_INTERVAL_MS;
    },
  });
};
