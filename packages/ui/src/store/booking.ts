"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
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
  setSettings: (settings: Settings) => void;
  setCheckout: (checkout: Checkout | null) => void;
  resetBooking: () => void;
};

const STORE_VERSION = 49;

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

export const usePricing = () => useBookingStore((state) => state.step2?.pricing ?? null);
export const useTotalPrice = () => useBookingStore((state) => state.step2?.total ?? 0);
