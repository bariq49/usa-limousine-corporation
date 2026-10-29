import { useEffect } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";
import { createQuote, getEstimates } from "@/lib/api/quotes";
import { quoteRequest } from "@/lib/booking/quote-request";
import { useBookingStore } from "@/store/use-booking-store";

const QUOTE_REFRESH_MS = 10 * 60 * 1000;

export { quoteRequest };

export const useVehicleEstimates = () => {
  const { step1, returnTrip } = useBookingStore(
    useShallow((state) => ({ step1: state.step1, returnTrip: state.returnTrip })),
  );
  const request = quoteRequest({ step1, returnTrip });

  return useQuery({
    queryKey: ["quotes", "estimates", request],
    queryFn: () => getEstimates(request!),
    enabled: Boolean(request),
    placeholderData: keepPreviousData,
    retry: false,
  });
};

export const useSyncQuote = () => {
  const { step1, returnTrip, step2, step3, setQuote } = useBookingStore(
    useShallow((state) => ({
      step1: state.step1,
      returnTrip: state.returnTrip,
      step2: state.step2,
      step3: state.step3,
      setQuote: state.setQuote,
    })),
  );
  const request = step2
    ? quoteRequest({
        step1,
        returnTrip,
        step3,
        vehicleCategoryId: step2.vehicleCategory.id,
        vehicleCount: step2.vehicleCount,
      })
    : null;

  const query = useQuery({
    queryKey: ["quotes", "selected", request],
    queryFn: () => createQuote(request!),
    enabled: Boolean(request),
    placeholderData: keepPreviousData,
    refetchInterval: QUOTE_REFRESH_MS,
    retry: false,
  });
  const quote = query.isPlaceholderData ? null : (query.data ?? null);

  useEffect(() => {
    if (quote) setQuote(quote);
  }, [quote, setQuote]);

  return query;
};
