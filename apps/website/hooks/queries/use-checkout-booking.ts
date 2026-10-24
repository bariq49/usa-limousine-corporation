import { getCheckoutBooking } from "@/lib/api/checkout";
import { useQuery } from "@tanstack/react-query";

const MAX_POLLS = 20;
const POLL_INTERVAL_MS = 3000;

export const useCheckoutBooking = (sessionId: string | null | undefined, waitForResult = false) => {
  return useQuery({
    queryKey: ["checkout-booking", sessionId],
    queryFn: () => getCheckoutBooking(sessionId as string),
    enabled: Boolean(sessionId),
    retry: 2,
    refetchInterval: (query) => {
      if (!waitForResult) return false;
      const settled = query.state.data?.status !== "PENDING";
      return settled || query.state.dataUpdateCount >= MAX_POLLS ? false : POLL_INTERVAL_MS;
    },
  });
};
