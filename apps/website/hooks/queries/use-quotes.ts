import { useEffect } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";
import { createQuote, getEstimates } from "@/lib/api/quotes";
import { useBookingStore } from "@/store/use-booking-store";
import { TRIP_TYPES } from "@/constants/booking-constants";
import type {
    BookingStep1PersistedData,
    BookingStep3PersistedData,
    QuoteRequest,
    ReturnTrip,
} from "@/types/booking.types";

const QUOTE_REFRESH_MS = 10 * 60 * 1000;

type QuoteRequestParams = {
    step1: BookingStep1PersistedData | null;
    returnTrip: ReturnTrip | null;
    step3?: BookingStep3PersistedData | null;
    vehicleCategoryId?: string;
    vehicleCount?: number;
};

export const quoteRequest = ({
    step1,
    returnTrip,
    step3,
    vehicleCategoryId,
    vehicleCount,
}: QuoteRequestParams): QuoteRequest | null => {
    const deliveryAddress = step1?.deliveryAddress.trim();
    if (!step1 || step1.tripType === TRIP_TYPES.HOURLY || !deliveryAddress) return null;

    const isReturn = Boolean(returnTrip);
    const seatCounts = new Map<string, { quantity: number; returnQuantity: number }>();
    (step3?.childSeats ?? []).forEach((seat) => {
        const counts = seatCounts.get(seat.id) ?? { quantity: 0, returnQuantity: 0 };
        counts.quantity += seat.quantity;
        seatCounts.set(seat.id, counts);
    });
    (isReturn ? (step3?.returnChildSeats ?? []) : []).forEach((seat) => {
        const counts = seatCounts.get(seat.id) ?? { quantity: 0, returnQuantity: 0 };
        counts.returnQuantity += seat.quantity;
        seatCounts.set(seat.id, counts);
    });
    const meetGreet = Boolean(step3?.meetGreetEnabled);
    const returnMeetGreet = isReturn && Boolean(step3?.returnMeetGreetEnabled);

    return {
        vehicleCategoryId,
        vehicleCount,
        bookingType: isReturn ? "RETURN" : "ONE_WAY",
        address: {
            pickup: { address: step1.pickupAddress },
            dropoff: { address: deliveryAddress },
            stops: step1.stops,
            distance: Math.round((step1.distance ?? 0) * 100) / 100,
            duration: step1.travelDuration ?? 0,
            travelDuration: step1.travelDuration,
        },
        bookingTime: {
            pickupDate: step1.pickupDate,
            pickupTime: step1.pickupTime,
            returnDate: returnTrip?.returnDate,
            returnTime: returnTrip?.returnTime,
        },
        meetAndGreet:
            meetGreet || returnMeetGreet
                ? {
                      enabled: meetGreet,
                      returnEnabled: returnMeetGreet,
                  }
                : undefined,
        extraServices: Array.from(seatCounts, ([extraServiceId, counts]) => ({
            extraServiceId,
            quantity: counts.quantity,
            returnQuantity: counts.returnQuantity,
        })),
        luggage: (step3?.luggage ?? []).map((item) => ({
            luggageTypeId: item.id,
            quantity: item.quantity,
        })),
        notifications: {
            email: step3?.notifyByEmail ?? true,
            sms: step3?.notifyBySms ?? false,
        },
    };
};

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
