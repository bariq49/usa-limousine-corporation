import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import type {
    VehicleCategory,
    Pricing,
    BookingStep1PersistedData,
    BookingStep2PersistedData,
    BookingStep3PersistedData,
    BookingSettings,
    CheckoutSession,
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

// =============== STATE ===============

interface BookingState {
    step1: BookingStep1PersistedData | null;
    step2: BookingStep2PersistedData | null;
    step3: BookingStep3PersistedData | null;
    bookingSettings: BookingSettings | null;
    checkout: CheckoutSession | null;

    // actions
    setStep1Data: (data: BookingStep1PersistedData) => void;
    setStep2Data: (data: Partial<BookingStep2PersistedData> | null) => void;
    setStep3Data: (data: Partial<BookingStep3PersistedData> | null) => void;
    setBookingSettings: (settings: BookingSettings) => void;
    setCheckout: (checkout: CheckoutSession | null) => void;
    /** Clears the trip once it has been booked and paid. */
    resetBooking: () => void;
}

// =============== STORE ===============

const STORE_VERSION = 38;

export const resolveVehicleCategoryPrice = (vehicleCategory: VehicleCategory): number =>
    vehicleCategory.priceBreakdown?.oneWayTotalPrice ?? 0;

export const useBookingStore = create<BookingState>()(
    persist(
        (set) => ({
            step1: null,
            step2: null,
            step3: null,
            bookingSettings: null,
            checkout: null,

            setStep1Data: (data) =>
                set({
                    step1: data,
                    step2: null,
                    step3: null,
                }),

            setStep2Data: (data) =>
                set((state) => {
                    if (data === null) {
                        return {
                            step2: null,
                            step3: null,
                        };
                    }

                    const vehicleCategory =
                        data.vehicleCategory ?? state.step2?.vehicleCategory;

                    if (!vehicleCategory) {
                        return {
                            step2: null,
                        };
                    }

                    const step2Data: BookingStep2PersistedData = {
                        vehicleCategory,
                        vehicleCount: data.vehicleCount ?? state.step2?.vehicleCount ?? 1,
                        passengers: data.passengers ?? state.step2?.passengers ?? 1,
                        bags: data.bags ?? state.step2?.bags ?? 0,
                    };

                    return {
                        step2: step2Data,
                        step3: data.vehicleCategory !== undefined ? null : state.step3,
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
                            pickupDate: data.pickupDate ?? state.step3?.pickupDate ?? "",
                            pickupTime: data.pickupTime ?? state.step3?.pickupTime ?? "",
                            notes: data.notes,
                            airlineName: data.airlineName,
                            flightNumber: data.flightNumber,
                            meetGreetEnabled: data.meetGreetEnabled ?? false,
                            meetGreet: data.meetGreet,
                            luggage: data.luggage ?? [],
                            childSeats: data.childSeats ?? [],
                            returnEnabled: data.returnEnabled ?? false,
                            returnDate: data.returnDate,
                            returnTime: data.returnTime,
                            returnAirlineName: data.returnAirlineName,
                            returnFlightNumber: data.returnFlightNumber,
                            returnMeetGreetEnabled: data.returnMeetGreetEnabled ?? false,
                            returnMeetGreet: data.returnMeetGreet,
                            returnChildSeats: data.returnChildSeats ?? [],
                        },
                    };
                }),

            setBookingSettings: (settings) =>
                set({
                    bookingSettings: settings,
                }),

            setCheckout: (checkout) => set({ checkout }),

            resetBooking: () =>
                set({
                    step1: null,
                    step2: null,
                    step3: null,
                    checkout: null,
                }),
        }),
        {
            name: 'usa-limousine-booking-storage',
            version: STORE_VERSION,
            storage: createJSONStorage(() => localStorage),

            // Older drafts are not carried over; the booking form simply starts fresh.
            migrate: () => ({
                step1: null,
                step2: null,
                step3: null,
                bookingSettings: null,
                checkout: null,
            }) as unknown as BookingState,

            partialize: (state) => ({
                step1: state.step1,
                step2: state.step2,
                step3: state.step3,
                bookingSettings: state.bookingSettings,
                checkout: state.checkout,
            }),
        }
    )
);

// =============== PRICE ENGINE ===============

export const calculatePricing = (state: BookingState): Pricing | null => {
    const { bookingSettings, step1, step2, step3 } = state;
    const vehicleCategory = step2?.vehicleCategory;

    if (!vehicleCategory || !step1) return null;

    const breakdown = vehicleCategory.priceBreakdown;
    // Each vehicle pays its own fare; extras below are charged once per booking.
    const vehicleCount = step2?.vehicleCount ?? 1;

    const oneWayBasePrice = (breakdown?.oneWayBasePrice ?? 0) * vehicleCount;
    const oneWaySurchargePercentage = breakdown?.oneWaySurchargePercentage ?? 0;
    const oneWaySurchargeAmount = (breakdown?.oneWaySurchargeAmount ?? 0) * vehicleCount;
    const oneWayGratuityPercentage = breakdown?.oneWayGratuityPercentage ?? 0;
    const oneWayGratuityAmount = (breakdown?.oneWayGratuityAmount ?? 0) * vehicleCount;
    const oneWayTaxPercentage = breakdown?.oneWayTaxPercentage ?? 0;
    const oneWayTaxAmount = (breakdown?.oneWayTaxAmount ?? 0) * vehicleCount;
    const oneWayTransactionFeePercentage =
        breakdown?.oneWayTransactionFeePercentage ?? 0;
    const oneWayTransactionFeeAmount = (breakdown?.oneWayTransactionFeeAmount ?? 0) * vehicleCount;
    const oneWayDiscountPercentage = breakdown?.oneWayDiscountPercentage ?? 0;
    const oneWayDiscountAmount = (breakdown?.oneWayDiscountAmount ?? 0) * vehicleCount;
    const oneWayAirportFeeAmount = (breakdown?.oneWayAirportFeeAmount ?? 0) * vehicleCount;
    const oneWayTotalPrice = resolveVehicleCategoryPrice(vehicleCategory) * vehicleCount;

    const returnEnabled = Boolean(step3?.returnEnabled);

    const returnBasePrice = returnEnabled ? (breakdown?.returnBasePrice ?? 0) * vehicleCount : 0;
    const returnSurchargePercentage = returnEnabled
        ? (breakdown?.returnSurchargePercentage ?? 0)
        : 0;
    const returnSurchargeAmount = returnEnabled
        ? (breakdown?.returnSurchargeAmount ?? 0) * vehicleCount
        : 0;
    const returnGratuityPercentage = returnEnabled
        ? (breakdown?.returnGratuityPercentage ?? 0)
        : 0;
    const returnGratuityAmount = returnEnabled
        ? (breakdown?.returnGratuityAmount ?? 0) * vehicleCount
        : 0;
    const returnTaxPercentage = returnEnabled ? (breakdown?.returnTaxPercentage ?? 0) : 0;
    const returnTaxAmount = returnEnabled ? (breakdown?.returnTaxAmount ?? 0) * vehicleCount : 0;
    const returnTransactionFeePercentage = returnEnabled
        ? (breakdown?.returnTransactionFeePercentage ?? 0)
        : 0;
    const returnTransactionFeeAmount = returnEnabled
        ? (breakdown?.returnTransactionFeeAmount ?? 0) * vehicleCount
        : 0;
    const returnDiscountPercentage = returnEnabled
        ? (breakdown?.returnDiscountPercentage ?? 0)
        : 0;
    const returnDiscountAmount = returnEnabled
        ? (breakdown?.returnDiscountAmount ?? 0) * vehicleCount
        : 0;
    const returnAirportFeeAmount = returnEnabled
        ? (breakdown?.returnAirportFeeAmount ?? 0) * vehicleCount
        : 0;
    const returnTotalPrice = returnEnabled
        ? (breakdown?.returnTotalPrice ?? 0) * vehicleCount
        : 0;

    const stopFeeAmount =
        step1?.stops?.length && bookingSettings?.stopFee
            ? (bookingSettings.stopFee || 0) * (step1?.stops?.length || 0)
            : 0;

    const oneWayMeetAndGreetFeeAmount =
        step3?.meetGreetEnabled && bookingSettings?.meetAndGreetFee
            ? bookingSettings.meetAndGreetFee || 0
            : 0;

    const returnMeetAndGreetFeeAmount =
        returnEnabled &&
        step3?.returnMeetGreetEnabled &&
        bookingSettings?.meetAndGreetFee
            ? bookingSettings.meetAndGreetFee || 0
            : 0;

    const oneWayChildSeatFeeAmount = (step3?.childSeats ?? []).reduce(
        (sum, seat) => sum + (seat.price || 0) * (seat.quantity || 0),
        0
    );

    const luggageFeeAmount = (step3?.luggage ?? []).reduce(
        (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
        0
    );

    const returnChildSeatFeeAmount = returnEnabled
        ? (step3?.returnChildSeats ?? []).reduce(
              (sum, seat) => sum + (seat.price || 0) * (seat.quantity || 0),
              0
          )
        : 0;

    const total = Math.max(
        oneWayTotalPrice +
            returnTotalPrice +
            stopFeeAmount +
            luggageFeeAmount +
            oneWayMeetAndGreetFeeAmount +
            returnMeetAndGreetFeeAmount +
            oneWayChildSeatFeeAmount +
            returnChildSeatFeeAmount,
        0
    );

    return {
        oneWayBasePrice,
        oneWaySurchargePercentage,
        oneWaySurchargeAmount,
        oneWayGratuityPercentage,
        oneWayGratuityAmount,
        oneWayTaxPercentage,
        oneWayTaxAmount,
        oneWayTransactionFeePercentage,
        oneWayTransactionFeeAmount,
        oneWayDiscountPercentage,
        oneWayDiscountAmount,
        oneWayAirportFeeAmount,
        oneWayTotalPrice,
        returnBasePrice,
        returnSurchargePercentage,
        returnSurchargeAmount,
        returnGratuityPercentage,
        returnGratuityAmount,
        returnTaxPercentage,
        returnTaxAmount,
        returnTransactionFeePercentage,
        returnTransactionFeeAmount,
        returnDiscountPercentage,
        returnDiscountAmount,
        returnAirportFeeAmount,
        returnTotalPrice,
        stopFeeAmount,
        luggageFeeAmount,
        oneWayMeetAndGreetFeeAmount,
        returnMeetAndGreetFeeAmount,
        oneWayChildSeatFeeAmount,
        returnChildSeatFeeAmount,
        subtotal: oneWayTotalPrice + returnTotalPrice,
        total,
    };
};

// =============== SELECTORS ===============

export const usePricing = () =>
    useBookingStore(useShallow((state) => calculatePricing(state)));

export const useTotalPrice = () =>
    useBookingStore((state) => calculatePricing(state)?.total ?? 0);
