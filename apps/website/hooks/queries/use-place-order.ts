import { useMutation } from "@tanstack/react-query";
import type { BookingDraft } from "@/types/booking.types";
import { useBookingStore, calculatePricing } from "@/store/use-booking-store";
import { TRIP_TYPES } from "@/constants/booking-constants";
import { getCustomerPortalUrl } from "@/lib/api/base-url";

/**
 * Builds the booking in the backend's create shape and hands it to the customer
 * portal, which signs the rider in (or up) and submits it as a pending booking.
 */
export const usePlaceOrder = () => {
    return useMutation({
        mutationFn: async () => {
            const state = useBookingStore.getState();
            const { step1, step2, step3 } = state;
            const category = step2?.vehicleCategory;

            if (!step1 || !step2 || !step3 || !category) {
                throw new Error("Missing booking context for order.");
            }

            const pricing = calculatePricing(state);
            if (!pricing) {
                throw new Error("Unable to calculate booking price.");
            }

            const isHourly = step1.tripType === TRIP_TYPES.HOURLY;
            const returnEnabled = Boolean(step3.returnEnabled) && !isHourly;

            const seatCounts = new Map<string, number>();
            (step3.childSeats ?? [])
                .concat(returnEnabled ? (step3.returnChildSeats ?? []) : [])
                .forEach((seat) => {
                    seatCounts.set(seat.id, (seatCounts.get(seat.id) ?? 0) + seat.quantity);
                });

            const extraServices = Array.from(seatCounts, ([extraServiceId, quantity]) => ({
                extraServiceId,
                quantity,
            })).filter((item) => item.quantity > 0);

            const returnNotes = returnEnabled
                ? [
                      step3.returnAirlineName && `Return airline: ${step3.returnAirlineName}`,
                      step3.returnFlightNumber && `Return flight: ${step3.returnFlightNumber}`,
                      step3.returnMeetGreet && `Return meet & greet sign: ${step3.returnMeetGreet}`,
                      step3.returnNotes && `Return notes: ${step3.returnNotes}`,
                  ].filter(Boolean)
                : [];
            const notes = [step3.notes, returnNotes.join("\n")].filter(Boolean).join("\n\n");
            const deliveryAddress = step1.deliveryAddress.trim();

            const draft: BookingDraft = {
                vehicleCategoryId: category._id,
                vehicleCategoryName: category.name,
                bookingType: isHourly ? "HOURLY" : returnEnabled ? "RETURN" : "ONE_WAY",
                address: {
                    pickup: { address: step1.pickupAddress },
                    dropoff: deliveryAddress ? { address: deliveryAddress } : undefined,
                    stops: step1.stops,
                    distance: step1.distance ?? 0,
                    duration: isHourly
                        ? (step1.duration ?? 0) * 60
                        : (step1.travelDuration ?? 0),
                },
                passenger: {
                    passengerCount: step2.passengers,
                    name: `${step3.firstName.trim()} ${step3.lastName.trim()}`.trim(),
                    phone: step3.phone ? `+${step3.phone.replace(/\D/g, "")}` : "",
                    email: step3.email.trim(),
                    flightNumber: step1.isAirportSelected ? step3.flightNumber : undefined,
                },
                bookingTime: {
                    pickupDate: step1.pickupDate,
                    pickupTime: step1.pickupTime,
                    returnDate: returnEnabled ? step3.returnDate : undefined,
                    returnTime: returnEnabled ? step3.returnTime : undefined,
                },
                flightDetails: step1.isAirportSelected
                    ? { flightName: step3.airlineName, flightNumber: step3.flightNumber }
                    : undefined,
                meetAndGreet:
                    step3.meetGreetEnabled || (returnEnabled && step3.returnMeetGreetEnabled)
                        ? {
                              enabled: Boolean(step3.meetGreetEnabled),
                              signName: step3.meetGreet,
                              returnEnabled: returnEnabled && Boolean(step3.returnMeetGreetEnabled),
                          }
                        : undefined,
                extraServices,
                luggage: (step3.luggage ?? []).map((item) => ({
                    luggageTypeId: item.id,
                    quantity: item.quantity,
                })),
                notes: notes || undefined,
                pricing: {
                    basePrice: pricing.subtotal,
                    stopsPrice: pricing.stopFeeAmount,
                    airportPickupPrice:
                        pricing.oneWayAirportFeeAmount + pricing.returnAirportFeeAmount,
                    extraServicesPrice:
                        pricing.oneWayMeetAndGreetFeeAmount +
                        pricing.returnMeetAndGreetFeeAmount +
                        pricing.oneWayChildSeatFeeAmount +
                        pricing.returnChildSeatFeeAmount +
                        pricing.luggageFeeAmount,
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
