import { useMutation } from "@tanstack/react-query";
import type { BookingDraft } from "@/types/booking.types";
import { useBookingStore, calculatePricing } from "@/store/use-booking-store";
import { TRIP_TYPES } from "@/constants/booking-constants";
import { getCustomerPortalUrl } from "@/lib/api/base-url";

/**
 * Builds the booking draft from the store and hands it to the customer portal, where the
 * rider signs in and confirms. The server re-prices the booking, so only totals are sent.
 */
export const usePlaceOrder = () => {
    return useMutation({
        mutationFn: async () => {
            const state = useBookingStore.getState();
            const { step1, step2, step3 } = state;
            const pricing = calculatePricing(state);

            if (!step1 || !step2 || !step3 || !pricing) {
                throw new Error("Missing booking details.");
            }

            const isHourly = step1.tripType === TRIP_TYPES.HOURLY;
            const returnEnabled = Boolean(step3.returnEnabled);
            const deliveryAddress = step1.deliveryAddress.trim();

            const seatCounts = new Map<string, number>();
            (step3.childSeats ?? [])
                .concat(returnEnabled ? (step3.returnChildSeats ?? []) : [])
                .forEach((seat) => {
                    seatCounts.set(seat.id, (seatCounts.get(seat.id) ?? 0) + seat.quantity);
                });

            const returnDetails = returnEnabled
                ? [
                      step3.returnAirlineName && `Return airline: ${step3.returnAirlineName}`,
                      step3.returnFlightNumber && `Return flight: ${step3.returnFlightNumber}`,
                      step3.returnMeetGreet && `Return meet & greet sign: ${step3.returnMeetGreet}`,
                  ].filter(Boolean)
                : [];
            const notes = [step3.notes, returnDetails.join("\n")].filter(Boolean).join("\n\n");

            const draft: BookingDraft = {
                vehicleCategoryId: step2.vehicleCategory.id,
                vehicleCategoryName: step2.vehicleCategory.name,
                vehicleCount: step2.vehicleCount,
                bookingType: isHourly ? "HOURLY" : returnEnabled ? "RETURN" : "ONE_WAY",
                address: {
                    pickup: { address: step1.pickupAddress },
                    dropoff: deliveryAddress ? { address: deliveryAddress } : undefined,
                    stops: step1.stops,
                    distance: step1.distance ?? 0,
                    duration: isHourly ? (step1.duration ?? 0) * 60 : (step1.travelDuration ?? 0),
                },
                passenger: {
                    passengerCount: step2.passengers,
                    name: `${step3.title} ${step3.fullName.trim()}`,
                    phone: step3.phone ? `+${step3.phone.replace(/\D/g, "")}` : "",
                    email: step3.email.trim(),
                    ccEmail: step3.ccEmail,
                },
                bookingTime: {
                    pickupDate: step3.pickupDate,
                    pickupTime: step3.pickupTime,
                    returnDate: returnEnabled ? step3.returnDate : undefined,
                    returnTime: returnEnabled ? step3.returnTime : undefined,
                },
                flightDetails: step1.isAirportSelected
                    ? { flightName: step3.airlineName, flightNumber: step3.flightNumber }
                    : undefined,
                meetAndGreet:
                    step3.meetGreetEnabled || step3.returnMeetGreetEnabled
                        ? {
                              enabled: Boolean(step3.meetGreetEnabled),
                              signName: step3.meetGreet,
                              returnEnabled: Boolean(step3.returnMeetGreetEnabled),
                          }
                        : undefined,
                extraServices: Array.from(seatCounts, ([extraServiceId, quantity]) => ({
                    extraServiceId,
                    quantity,
                })),
                luggage: (step3.luggage ?? []).map((item) => ({
                    luggageTypeId: item.id,
                    quantity: item.quantity,
                })),
                notes: notes || undefined,
                pricing: {
                    basePrice: pricing.subtotal,
                    total: Math.round(pricing.total * 100) / 100,
                },
            };

            const url = new URL("/book", getCustomerPortalUrl());
            url.searchParams.set("draft", JSON.stringify(draft));
            window.location.assign(url.toString());

            return draft;
        },
    });
};
