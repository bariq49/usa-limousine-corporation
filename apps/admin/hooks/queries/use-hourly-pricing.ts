import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  bulkDeleteHourlyPricings,
  createHourlyPricing,
  deleteHourlyPricing,
  getHourlyPricing,
  getHourlyPricings,
  updateHourlyPricing,
} from "../../lib/api/hourly-pricing";
import type { CreatePayload, Query, UpdatePayload } from "../../lib/types/hourly-pricing";

export const hourlyPricingKeys = {
  all: ["vehicle-category-hourly-pricing"] as const,
  list: (params?: Query) => [...hourlyPricingKeys.all, "list", params] as const,
  detail: (id: string) => [...hourlyPricingKeys.all, "detail", id] as const,
};

export const useHourlyPricings = (params?: Query) => {
  return useQuery({
    queryKey: hourlyPricingKeys.list(params),
    queryFn: () => getHourlyPricings(params),
  });
};

export const useHourlyPricing = (id: string) => {
  return useQuery({
    queryKey: hourlyPricingKeys.detail(id),
    queryFn: () => getHourlyPricing(id),
    enabled: Boolean(id),
  });
};

export const useCreateHourlyPricing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePayload) => createHourlyPricing(payload),
    onSuccess: () => {
      toast.success("Hourly pricing created successfully");
      return queryClient.invalidateQueries({ queryKey: hourlyPricingKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create hourly pricing");
    },
  });
};

export const useUpdateHourlyPricing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePayload }) =>
      updateHourlyPricing(id, payload),
    onSuccess: () => {
      toast.success("Hourly pricing updated successfully");
      return queryClient.invalidateQueries({ queryKey: hourlyPricingKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update hourly pricing");
    },
  });
};

export const useDeleteHourlyPricing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteHourlyPricing(id),
    onSuccess: () => {
      toast.success("Hourly pricing deleted successfully");
      return queryClient.invalidateQueries({ queryKey: hourlyPricingKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete hourly pricing");
    },
  });
};

export const useBulkDeleteHourlyPricings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteHourlyPricings(ids),
    onSuccess: () => {
      toast.success("Hourly pricing deleted successfully");
      return queryClient.invalidateQueries({ queryKey: hourlyPricingKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete hourly pricing");
    },
  });
};
