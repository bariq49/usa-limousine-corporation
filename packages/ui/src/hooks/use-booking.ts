"use client";

import { useEffect, useState } from "react";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useBookingStore } from "../store/booking";
import { formatHrs } from "../utils/duration";
import { draftBooking, getBooking, startCheckout } from "../lib/booking/checkout";
import type { ApiError } from "../types/api";
import { getExtraServices } from "../lib/booking/extra-services";
import { getHourlyDurations } from "../lib/booking/hourly-durations";
import { getLuggageTypes } from "../lib/booking/luggage";
import { getEstimates } from "../lib/booking/estimates";
import { getSettings } from "../lib/booking/settings";
import type { EstimateRequest } from "../types/booking";

export function useHasHydrated() {
  const [hasHydrated, setHasHydrated] = useState(false);
  useEffect(() => {
    setHasHydrated(true);
  }, []);
  return hasHydrated;
}

export const useSettings = () => {
  return useQuery({
    queryKey: ["platform-settings"],
    queryFn: getSettings,
  });
};

export const useHourlyDurations = (enabled = true) => {
  return useQuery({
    queryKey: ["hourly-durations"],
    queryFn: getHourlyDurations,
    enabled,
    select: (hours) =>
      hours.map((value) => ({
        label: formatHrs({ hours: value }),
        value: String(value),
      })),
  });
};

export const useLuggageTypes = (vehicleCategoryId: string | null | undefined) => {
  return useQuery({
    queryKey: ["luggage-types", vehicleCategoryId],
    queryFn: () => getLuggageTypes(vehicleCategoryId!),
    enabled: Boolean(vehicleCategoryId),
    staleTime: 10 * 60 * 1000,
  });
};

export const useExtraServices = () => {
  return useQuery({
    queryKey: ["extra-services"],
    queryFn: getExtraServices,
    staleTime: 10 * 60 * 1000,
  });
};

export const useEstimates = (request: EstimateRequest | null) => {
  return useQuery({
    queryKey: ["estimates", request],
    queryFn: () => getEstimates(request!),
    enabled: Boolean(request),
    placeholderData: keepPreviousData,
    retry: false,
  });
};

export const usePlaceOrder = () => {
  return useMutation({
    mutationFn: async () => {
      const { step1, step2, step3, returnTrip, setCheckout } = useBookingStore.getState();
      if (!step1 || !step2 || !step3) {
        throw new Error("Missing booking details.");
      }
      if (!step2.pricing || step2.total <= 0) {
        throw new Error("We are still pricing your trip. Please try again in a moment.");
      }

      const checkout = await startCheckout(
        draftBooking({ step1, step2, step3, returnTrip }),
      );
      setCheckout({ orderId: checkout.orderId, url: checkout.url });
      window.location.assign(checkout.url);
      return checkout;
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "We could not start the payment. Please try again.");
    },
  });
};

export const useBooking = (id: string | null | undefined) => {
  return useQuery({
    queryKey: ["booking", id],
    queryFn: () => getBooking(id!),
    enabled: Boolean(id),
  });
};
