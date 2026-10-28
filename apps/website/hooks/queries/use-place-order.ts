import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import type { BookingDraft, Quote } from "@/types/booking.types";
import type { ApiError } from "@/lib/api/client";
import { useBookingStore } from "@/store/use-booking-store";
import { startCheckout } from "@/lib/api/checkout";
import { formatPrice } from "@/lib/utils";
import { quoteRequest } from "./use-quotes";

type PlaceOrderOptions = {
    onPriceChanged?: (previousTotal: number, quote: Quote) => void;
};

export const usePlaceOrder = ({ onPriceChanged }: PlaceOrderOptions = {}) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            const { step1, returnTrip, step2, step3, quote } = useBookingStore.getState();
            const request =
                step2 &&
                quoteRequest({
                    step1,
                    returnTrip,
                    step3,
                    vehicleCategoryId: step2.vehicleCategory.id,
                    vehicleCount: step2.vehicleCount,
                });

            if (!step2 || !step3 || !request) {
                throw new Error("Missing booking details.");
            }
            if (!quote) {
                throw new Error("We are still pricing your trip. Please try again in a moment.");
            }

            const returnDetails = returnTrip
                ? [
                      step3.returnFlightNumber && `Return flight: ${step3.returnFlightNumber}`,
                      step3.returnMeetGreet && `Return meet & greet sign: ${step3.returnMeetGreet}`,
                  ].filter(Boolean)
                : [];
            const returnNotes = [step3.returnNotes, returnDetails.join("\n")]
                .filter(Boolean)
                .join("\n\n");

            const draft: BookingDraft = {
                vehicleCategoryId: step2.vehicleCategory.id,
                vehicleCount: step2.vehicleCount,
                bookingType: request.bookingType,
                address: request.address,
                passenger: {
                    passengerCount: step2.passengers,
                    name: `${step3.title} ${step3.fullName.trim()}`,
                    phone: step3.phone ? `+${step3.phone.replace(/\D/g, "")}` : "",
                    email: step3.email.trim(),
                    ccEmail: step3.ccEmail,
                },
                bookingTime: request.bookingTime,
                flightDetails: step1?.isAirportSelected
                    ? { flightNumber: step3.flightNumber }
                    : undefined,
                meetAndGreet: request.meetAndGreet
                    ? Object.assign({ signName: step3.meetGreet }, request.meetAndGreet)
                    : undefined,
                extraServices: request.extraServices,
                luggage: request.luggage,
                notifications: request.notifications,
                notes: step3.notes || undefined,
                returnNotes: returnNotes || undefined,
                quoteId: quote.id,
            };

            const checkout = await startCheckout(draft);
            useBookingStore.getState().setCheckout({ orderId: checkout.orderId, url: checkout.url });
            window.location.assign(checkout.url);
            return checkout;
        },
        onError: (error: ApiError) => {
            const updated = error.details?.quote as Quote | undefined;
            if (error.code === "PRICE_CHANGED" && updated) {
                const previousTotal = useBookingStore.getState().quote?.total ?? 0;
                useBookingStore.getState().setQuote(updated);
                if (onPriceChanged) {
                    onPriceChanged(previousTotal, updated);
                    return;
                }
                toast.error(`${error.message} New total: ${formatPrice(updated.total)}.`);
                return;
            }
            if (error.code === "QUOTE_INVALID" || error.code === "QUOTE_USED") {
                void queryClient.invalidateQueries({ queryKey: ["quotes"] });
            }
            toast.error(error.message || "We could not start the payment. Please try again.");
        },
    });
};
