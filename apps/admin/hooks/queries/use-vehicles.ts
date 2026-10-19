import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { bulkDeleteVehicles, deleteVehicle, getVehicle, getVehicles } from "../../lib/api/vehicles";
import type { Query } from "../../lib/types/vehicles";

export const vehicleKeys = {
  all: ["vehicles"] as const,
  list: (params?: Query) => [...vehicleKeys.all, "list", params] as const,
  detail: (id: string) => [...vehicleKeys.all, "detail", id] as const,
};

export const useVehicles = (params?: Query) => {
  return useQuery({
    queryKey: vehicleKeys.list(params),
    queryFn: () => getVehicles(params),
  });
};

export const useVehicle = (id: string) => {
  return useQuery({
    queryKey: vehicleKeys.detail(id),
    queryFn: () => getVehicle(id),
    enabled: Boolean(id),
  });
};

export const useDeleteVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteVehicle(id),
    onSuccess: () => {
      toast.success("Vehicle deleted successfully");
      return queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete vehicle");
    },
  });
};

export const useBulkDeleteVehicles = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteVehicles(ids),
    onSuccess: () => {
      toast.success("Vehicles deleted successfully");
      return queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete vehicles");
    },
  });
};
