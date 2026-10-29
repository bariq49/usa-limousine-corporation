"use client";

import { useMemo } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";
import { TRIP_TYPES } from "../constants/booking";
import type { PricedLine } from "../types/booking-model";
import type {
  Estimate,
  EstimateRequest,
  Pricing,
  Settings,
  Step1,
  Step2,
  Step3,
  Checkout,
  Return,
} from "../types/booking";

type BookingState = {
  step1: Step1 | null;
  returnTrip: Return | null;
  step2: Step2 | null;
  step3: Step3 | null;
  settings: Settings | null;
  checkout: Checkout | null;
  setStep1: (step1: Step1) => void;
  setReturn: (returnTrip: Return | null) => void;
  setStep2: (step2: Step2 | null) => void;
  setStep3: (step3: Step3 | null) => void;
  applyEstimate: (estimate: Estimate) => void;
  setSettings: (settings: Settings) => void;
  setCheckout: (checkout: Checkout | null) => void;
  resetBooking: () => void;
};

type PricingState = Pick<
  BookingState,
  "step1" | "step2" | "step3" | "returnTrip" | "settings"
>;

const STORE_VERSION = 50;

export const useBookingStore = create<BookingState>()(
  persist(
    (set) => ({
      step1: null,
      returnTrip: null,
      step2: null,
      step3: null,
      settings: null,
      checkout: null,

      setStep1: (step1) =>
        set({
          step1,
          returnTrip: null,
          step2: null,
          step3: null,
        }),

      setReturn: (returnTrip) => set({ returnTrip }),

      setStep2: (step2) => set({ step2 }),

      setStep3: (step3) => set({ step3 }),

      applyEstimate: (estimate) =>
        set((state) => {
          const current = state.step2;
          if (!current) return state;
          if (
            current.pricing === estimate.pricing &&
            current.total === estimate.total &&
            current.distance === estimate.distance &&
            current.travelDuration === estimate.travelDuration
          ) {
            return state;
          }
          return {
            step2: {
              vehicleCategory: current.vehicleCategory,
              vehicleCount: current.vehicleCount,
              passengers: current.passengers,
              bags: current.bags,
              pricing: estimate.pricing,
              total: estimate.total,
              distance: estimate.distance,
              travelDuration: estimate.travelDuration,
            },
          };
        }),

      setSettings: (settings) => set({ settings }),

      setCheckout: (checkout) => set({ checkout }),

      resetBooking: () =>
        set({
          step1: null,
          returnTrip: null,
          step2: null,
          step3: null,
          checkout: null,
        }),
    }),
    {
      name: "usa-limousine-booking-storage",
      version: STORE_VERSION,
      storage: createJSONStorage(() => localStorage),
      migrate: () =>
        ({
          step1: null,
          returnTrip: null,
          step2: null,
          step3: null,
          settings: null,
          checkout: null,
        }) as unknown as BookingState,
      partialize: (state) => ({
        step1: state.step1,
        returnTrip: state.returnTrip,
        step2: state.step2,
        step3: state.step3,
        settings: state.settings,
        checkout: state.checkout,
      }),
    },
  ),
);

// =============== ESTIMATE REQUEST ===============

export function estimateRequest(
  state: Pick<BookingState, "step1" | "step2" | "returnTrip">,
): EstimateRequest | null {
  const { step1, step2, returnTrip } = state;
  if (!step1) return null;

  const isHourly = step1.tripType === TRIP_TYPES.HOURLY;
  const deliveryAddress = step1.deliveryAddress.trim();
  if (isHourly ? !step1.hourlyDuration : !deliveryAddress) return null;

  const isReturn = !isHourly && Boolean(returnTrip);

  return {
    vehicleCount: step2?.vehicleCount,
    bookingType: isHourly ? "HOURLY" : isReturn ? "RETURN" : "ONE_WAY",
    hourlyDuration: isHourly ? step1.hourlyDuration : undefined,
    address: {
      pickup: { address: step1.pickupAddress },
      dropoff: deliveryAddress ? { address: deliveryAddress } : undefined,
      stops: step1.stops,
      distance: 0,
      travelDuration: 0,
    },
    bookingTime: {
      pickupDate: step1.pickupDate,
      pickupTime: step1.pickupTime,
      returnDate: returnTrip?.returnDate,
      returnTime: returnTrip?.returnTime,
    },
  };
}

// =============== PRICE ENGINE ===============

function roundAmount(value: number) {
  return Math.round(value * 100) / 100;
}

export function calculatePricing(state: PricingState): Pricing | null {
  const pricing = state.step2?.pricing;
  if (!pricing) return null;

  const { step1, step3, returnTrip, settings } = state;
  const isReturn =
    step1?.tripType !== TRIP_TYPES.HOURLY && Boolean(returnTrip);
  const meetFee = settings?.meetAndGreetFee ?? 0;

  const oneWayMeet = step3?.meetGreetEnabled ? meetFee : 0;
  const returnMeet =
    isReturn && step3?.returnMeetGreetEnabled ? meetFee : 0;
  const meetAndGreetPrice = roundAmount(oneWayMeet + returnMeet);

  const seatLines = new Map<string, PricedLine>();
  for (const seat of step3?.childSeats ?? []) {
    if (seat.quantity <= 0) continue;
    seatLines.set(seat.id, {
      type: "EXTRA_SERVICE",
      id: seat.id,
      name: seat.name,
      quantity: seat.quantity,
      returnQuantity: 0,
      unitPrice: seat.price,
      total: roundAmount(seat.price * seat.quantity),
    });
  }
  if (isReturn) {
    for (const seat of step3?.returnChildSeats ?? []) {
      if (seat.quantity <= 0) continue;
      const existing = seatLines.get(seat.id);
      if (existing) {
        existing.returnQuantity = seat.quantity;
        existing.total = roundAmount(
          seat.price * (existing.quantity + seat.quantity),
        );
      } else {
        seatLines.set(seat.id, {
          type: "EXTRA_SERVICE",
          id: seat.id,
          name: seat.name,
          quantity: 0,
          returnQuantity: seat.quantity,
          unitPrice: seat.price,
          total: roundAmount(seat.price * seat.quantity),
        });
      }
    }
  }

  const luggageLines: PricedLine[] = (step3?.luggage ?? [])
    .filter((item) => item.quantity > 0)
    .map((item) => ({
      type: "LUGGAGE",
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      returnQuantity: 0,
      unitPrice: item.price,
      total: roundAmount(item.price * item.quantity),
    }));

  const items = Array.from(seatLines.values()).concat(luggageLines);
  const extraServicesPrice = roundAmount(
    items.reduce((sum, line) => sum + line.total, 0),
  );

  const notificationsPrice = step3
    ? roundAmount(
        (step3.notifyByEmail ? settings?.emailNotificationFee ?? 0 : 0) +
          (step3.notifyBySms ? settings?.smsNotificationFee ?? 0 : 0),
      )
    : 0;

  const baseTotal = roundAmount(
    pricing.total -
      (pricing.meetAndGreetPrice ?? 0) -
      (pricing.extraServicesPrice ?? 0) -
      (pricing.notificationsPrice ?? 0),
  );

  const oneWay = pricing.legs?.oneWay;
  const returnTripLeg = pricing.legs?.returnTrip;
  const legs =
    oneWay && returnTripLeg
      ? {
          oneWay: {
            basePrice: oneWay.basePrice,
            fuelSurchargePrice: oneWay.fuelSurchargePrice,
            gratuityPrice: oneWay.gratuityPrice,
            taxPrice: oneWay.taxPrice,
            transactionFeePrice: oneWay.transactionFeePrice,
            discountPrice: oneWay.discountPrice,
            airportPickupPrice: oneWay.airportPickupPrice,
            meetAndGreetPrice: oneWayMeet,
            total: roundAmount(
              oneWay.total - (oneWay.meetAndGreetPrice ?? 0) + oneWayMeet,
            ),
          },
          returnTrip: {
            basePrice: returnTripLeg.basePrice,
            fuelSurchargePrice: returnTripLeg.fuelSurchargePrice,
            gratuityPrice: returnTripLeg.gratuityPrice,
            taxPrice: returnTripLeg.taxPrice,
            transactionFeePrice: returnTripLeg.transactionFeePrice,
            discountPrice: returnTripLeg.discountPrice,
            airportPickupPrice: returnTripLeg.airportPickupPrice,
            meetAndGreetPrice: returnMeet,
            total: roundAmount(
              returnTripLeg.total -
                (returnTripLeg.meetAndGreetPrice ?? 0) +
                returnMeet,
            ),
          },
        }
      : undefined;

  return {
    total: roundAmount(
      baseTotal + meetAndGreetPrice + extraServicesPrice + notificationsPrice,
    ),
    basePrice: pricing.basePrice,
    fuelSurchargePrice: pricing.fuelSurchargePrice,
    gratuityPrice: pricing.gratuityPrice,
    taxPrice: pricing.taxPrice,
    transactionFeePrice: pricing.transactionFeePrice,
    discountPrice: pricing.discountPrice,
    meetAndGreetPrice,
    stopsPrice: pricing.stopsPrice,
    airportPickupPrice: pricing.airportPickupPrice,
    extraServicesPrice,
    notificationsPrice,
    subtotal: pricing.subtotal,
    currency: pricing.currency,
    legs,
    items,
    rates: pricing.rates,
  };
}

// =============== SELECTORS ===============

export function usePricing() {
  const state = useBookingStore(
    useShallow((store) => ({
      step1: store.step1,
      step2: store.step2,
      step3: store.step3,
      returnTrip: store.returnTrip,
      settings: store.settings,
    })),
  );

  return useMemo(() => calculatePricing(state), [state]);
}

export function useTotalPrice() {
  return usePricing()?.total ?? 0;
}
