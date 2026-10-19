import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  approve,
  bulkDelete,
  getActivity,
  getApplications,
  getOverview,
  getPerformance,
  getReviews,
  getVehicle,
  markUnderReview,
  reject,
  remove,
  suspend,
  unsuspend,
} from "../../lib/api/drivers";
import type { Params, Query } from "../../lib/types/drivers";

export const driverKeys = {
  all: ["driver-applications"] as const,
  list: (params?: Query) => ["driver-applications", "list", params] as const,
  overview: (id: string) => ["driver-applications", "overview", id] as const,
  reviews: (id: string) => ["driver-applications", "reviews", id] as const,
  vehicle: (id: string) => ["driver-applications", "vehicle", id] as const,
  activity: (id: string) => ["driver-applications", "activity", id] as const,
  performance: (id: string, params: Params) =>
    ["driver-applications", "performance", id, params] as const,
};

export const useDrivers = (params?: Query) => {
  return useQuery({
    queryKey: driverKeys.list(params),
    queryFn: () => getApplications(params),
  });
};

export const useOverview = (id: string) => {
  return useQuery({
    queryKey: driverKeys.overview(id),
    queryFn: () => getOverview(id),
    enabled: Boolean(id),
  });
};

export const useReviews = (id: string) => {
  return useQuery({
    queryKey: driverKeys.reviews(id),
    queryFn: () => getReviews(id),
    enabled: Boolean(id),
  });
};

export const useVehicle = (id: string) => {
  return useQuery({
    queryKey: driverKeys.vehicle(id),
    queryFn: () => getVehicle(id),
    enabled: Boolean(id),
  });
};

export const useActivity = (id: string) => {
  return useQuery({
    queryKey: driverKeys.activity(id),
    queryFn: () => getActivity(id),
    enabled: Boolean(id),
  });
};

export const usePerformance = (id: string, params: Params = {}) => {
  return useQuery({
    queryKey: driverKeys.performance(id, params),
    queryFn: () => getPerformance(id, params),
    enabled: Boolean(id),
  });
};

export const useRemove = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => remove(id),
    onSuccess: () => {
      toast.success("Driver deleted permanently");
      return queryClient.invalidateQueries({ queryKey: driverKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete driver");
    },
  });
};

export const useBulkDelete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => bulkDelete(ids),
    onSuccess: () => {
      toast.success("Applications deleted successfully");
      return queryClient.invalidateQueries({ queryKey: driverKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete applications");
    },
  });
};

export const useApprove = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => approve(id),
    onSuccess: (_, id) => {
      toast.success("Application approved successfully");
      queryClient.invalidateQueries({ queryKey: driverKeys.all });
      queryClient.invalidateQueries({ queryKey: driverKeys.overview(id) });
      queryClient.invalidateQueries({ queryKey: driverKeys.activity(id) });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to approve application");
    },
  });
};

export const useReject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => reject(id, reason),
    onSuccess: (_, { id }) => {
      toast.success("Application rejected successfully");
      queryClient.invalidateQueries({ queryKey: driverKeys.all });
      queryClient.invalidateQueries({ queryKey: driverKeys.overview(id) });
      queryClient.invalidateQueries({ queryKey: driverKeys.activity(id) });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reject application");
    },
  });
};

export const useMarkUnderReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => markUnderReview(id),
    onSuccess: (_, id) => {
      toast.success("Application marked as under review");
      queryClient.invalidateQueries({ queryKey: driverKeys.all });
      queryClient.invalidateQueries({ queryKey: driverKeys.overview(id) });
      queryClient.invalidateQueries({ queryKey: driverKeys.activity(id) });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to mark application under review");
    },
  });
};

export const useSuspend = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => suspend(id),
    onSuccess: (_, id) => {
      toast.success("Driver suspended successfully");
      queryClient.invalidateQueries({ queryKey: driverKeys.all });
      queryClient.invalidateQueries({ queryKey: driverKeys.overview(id) });
      queryClient.invalidateQueries({ queryKey: driverKeys.activity(id) });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to suspend driver");
    },
  });
};

export const useUnsuspend = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => unsuspend(id),
    onSuccess: (_, id) => {
      toast.success("Driver unsuspended successfully");
      queryClient.invalidateQueries({ queryKey: driverKeys.all });
      queryClient.invalidateQueries({ queryKey: driverKeys.overview(id) });
      queryClient.invalidateQueries({ queryKey: driverKeys.activity(id) });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to unsuspend driver");
    },
  });
};
