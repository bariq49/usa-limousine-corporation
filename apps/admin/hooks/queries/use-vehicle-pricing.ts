import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  bulkDeleteVehiclePricings,
  createVehiclePricing,
  deleteVehiclePricing,
  getVehiclePricings,
  updateVehiclePricing,
} from "../../lib/api/vehicle-pricing";
import type { CreatePayload, Query, UpdatePayload } from "../../lib/types/vehicle-pricing";

export const pricingKeys = {
  all: ["vehicle-category-pricing"] as const,
  list: (params?: Query) => [...pricingKeys.all, "list", params] as const,
  detail: (id: string) => [...pricingKeys.all, "detail", id] as const,
};

export const useVehiclePricings = (params?: Query) => {
  return useQuery({
    queryKey: pricingKeys.list(params),
    queryFn: () => getVehiclePricings(params),
  });
};

export const useCreateVehiclePricing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePayload) => createVehiclePricing(payload),
    onSuccess: () => {
      toast.success("Pricing tier created successfully");
      return queryClient.invalidateQueries({ queryKey: pricingKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create pricing tier");
    },
  });
};

export const useUpdateVehiclePricing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePayload }) =>
      updateVehiclePricing(id, payload),
    onSuccess: () => {
      toast.success("Pricing tier updated successfully");
      return queryClient.invalidateQueries({ queryKey: pricingKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update pricing tier");
    },
  });
};

export const useDeleteVehiclePricing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteVehiclePricing(id),
    onSuccess: () => {
      toast.success("Pricing tier deleted successfully");
      return queryClient.invalidateQueries({ queryKey: pricingKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete pricing tier");
    },
  });
};

export const useBulkDeleteVehiclePricings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteVehiclePricings(ids),
    onSuccess: () => {
      toast.success("Pricing tiers deleted successfully");
      return queryClient.invalidateQueries({ queryKey: pricingKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete pricing tiers");
    },
  });
};
