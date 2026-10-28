import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
    VehicleCategory,
    Pricing,
    BookingStep1PersistedData,
    BookingStep2PersistedData,
    BookingStep3PersistedData,
    BookingSettings,
    CheckoutSession,
    Quote,
    ReturnTrip,
} from '@/types/booking.types';
import { PASSENGER_TITLES } from '@/constants/booking-constants';

export type {
    VehicleCategory,
    Pricing,
    BookingStep1PersistedData,
    BookingStep2PersistedData,
    BookingStep3PersistedData,
    BookingSettings,
};


interface BookingState {
    step1: BookingStep1PersistedData | null;
    returnTrip: ReturnTrip | null;
    step2: BookingStep2PersistedData | null;
    step3: BookingStep3PersistedData | null;
    quote: Quote | null;
    bookingSettings: BookingSettings | null;
    checkout: CheckoutSession | null;
    setStep1Data: (data: BookingStep1PersistedData) => void;
    setReturnTrip: (returnTrip: ReturnTrip | null) => void;
    setStep2Data: (data: Partial<BookingStep2PersistedData> | null) => void;
    setStep3Data: (data: Partial<BookingStep3PersistedData> | null) => void;
    setQuote: (quote: Quote | null) => void;
    setBookingSettings: (settings: BookingSettings) => void;
    setCheckout: (checkout: CheckoutSession | null) => void;
    resetBooking: () => void;
}


const STORE_VERSION = 40;

export const useBookingStore = create<BookingState>()(
    persist(
        (set) => ({
            step1: null,
            returnTrip: null,
            step2: null,
            step3: null,
            quote: null,
            bookingSettings: null,
            checkout: null,

            setStep1Data: (data) =>
                set({
                    step1: data,
                    returnTrip: null,
                    step2: null,
                    step3: null,
                    quote: null,
                }),

            setReturnTrip: (returnTrip) =>
                set((state) => ({
                    returnTrip,
                    quote: null,
                    step3:
                        returnTrip || !state.step3
                            ? state.step3
                            : Object.assign({}, state.step3, {
                                  returnFlightNumber: undefined,
                                  returnMeetGreetEnabled: false,
                                  returnMeetGreet: undefined,
                                  returnChildSeats: [],
                                  returnNotes: undefined,
                              }),
                })),

            setStep2Data: (data) =>
                set((state) => {
                    if (data === null) {
                        return {
                            step2: null,
                            step3: null,
                            quote: null,
                        };
                    }

                    const vehicleCategory =
                        data.vehicleCategory ?? state.step2?.vehicleCategory;

                    if (!vehicleCategory) {
                        return {
                            step2: null,
                            quote: null,
                        };
                    }

                    const step2Data: BookingStep2PersistedData = {
                        vehicleCategory,
                        vehicleCount: data.vehicleCount ?? state.step2?.vehicleCount ?? 1,
                        passengers: data.passengers ?? state.step2?.passengers ?? 1,
                        bags: data.bags ?? state.step2?.bags ?? 0,
                    };
                    const vehicleChanged = data.vehicleCategory !== undefined;
                    const countChanged = step2Data.vehicleCount !== state.step2?.vehicleCount;

                    return {
                        step2: step2Data,
                        step3: vehicleChanged ? null : state.step3,
                        quote: vehicleChanged || countChanged ? null : state.quote,
                    };
                }),

            setStep3Data: (data) =>
                set((state) => {
                    if (data === null) {
                        return { step3: null };
                    }

                    return {
                        step3: {
                            title: data.title ?? state.step3?.title ?? PASSENGER_TITLES[0].value,
                            fullName: data.fullName ?? state.step3?.fullName ?? "",
                            phone: data.phone ?? state.step3?.phone ?? "",
                            email: data.email ?? state.step3?.email ?? "",
                            ccEmail: data.ccEmail,
                            notes: data.notes,
                            returnNotes: data.returnNotes,
                            notifyByEmail: data.notifyByEmail ?? true,
                            notifyBySms: data.notifyBySms ?? false,
                            flightNumber: data.flightNumber,
                            meetGreetEnabled: data.meetGreetEnabled ?? false,
                            meetGreet: data.meetGreet,
                            luggage: data.luggage ?? [],
                            childSeats: data.childSeats ?? [],
                            returnFlightNumber: data.returnFlightNumber,
                            returnMeetGreetEnabled: data.returnMeetGreetEnabled ?? false,
                            returnMeetGreet: data.returnMeetGreet,
                            returnChildSeats: data.returnChildSeats ?? [],
                        },
                    };
                }),

            setQuote: (quote) => set({ quote }),

            setBookingSettings: (settings) =>
                set({
                    bookingSettings: settings,
                }),

            setCheckout: (checkout) => set({ checkout }),

            resetBooking: () =>
                set({
                    step1: null,
                    returnTrip: null,
                    step2: null,
                    step3: null,
                    quote: null,
                    checkout: null,
                }),
        }),
        {
            name: 'usa-limousine-booking-storage',
            version: STORE_VERSION,
            storage: createJSONStorage(() => localStorage),

            migrate: () => ({
                step1: null,
                returnTrip: null,
                step2: null,
                step3: null,
                quote: null,
                bookingSettings: null,
                checkout: null,
            }) as unknown as BookingState,

            partialize: (state) => ({
                step1: state.step1,
                returnTrip: state.returnTrip,
                step2: state.step2,
                step3: state.step3,
                quote: state.quote,
                bookingSettings: state.bookingSettings,
                checkout: state.checkout,
            }),
        }
    )
);


export const usePricing = () => useBookingStore((state) => state.quote?.pricing ?? null);

export const useTotalPrice = () => useBookingStore((state) => state.quote?.total ?? 0);
