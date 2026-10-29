import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  assignDriver,
  createDriver,
  deleteDriver,
  getAssignments,
  getDriver,
  getDriverBookings,
  getDriverStats,
  getDrivers,
  unassignDriver,
  updateDriver,
} from "../../lib/api/drivers";
import type {
  AssignPayload,
  DriverBookingsQuery,
  DriverPayload,
  DriverQuery,
  StatsPeriod,
} from "../../lib/types/drivers";

export const driverKeys = {
  all: ["drivers"] as const,
  list: (params?: DriverQuery) => ["drivers", "list", params] as const,
  detail: (id: string) => ["drivers", "detail", id] as const,
  stats: (id: string, period: StatsPeriod) => ["drivers", "stats", id, period] as const,
  bookings: (id: string, params?: DriverBookingsQuery) =>
    ["drivers", "bookings", id, params] as const,
  assignments: (bookingId: string) => ["assignments", bookingId] as const,
};

export const useDrivers = (params?: DriverQuery, enabled = true) => {
  return useQuery({
    queryKey: driverKeys.list(params),
    queryFn: () => getDrivers(params),
    enabled,
  });
};

export const useDriver = (id: string) => {
  return useQuery({
    queryKey: driverKeys.detail(id),
    queryFn: () => getDriver(id),
    enabled: Boolean(id),
  });
};

export const useDriverStats = (id: string, period: StatsPeriod) => {
  return useQuery({
    queryKey: driverKeys.stats(id, period),
    queryFn: () => getDriverStats(id, period),
    enabled: Boolean(id),
  });
};

export const useDriverBookings = (id: string, params?: DriverBookingsQuery) => {
  return useQuery({
    queryKey: driverKeys.bookings(id, params),
    queryFn: () => getDriverBookings(id, params),
    enabled: Boolean(id),
  });
};

export const useCreateDriver = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: DriverPayload) => createDriver(payload),
    onSuccess: () => {
      toast.success("Driver registered successfully");
      return queryClient.invalidateQueries({ queryKey: driverKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to register driver");
    },
  });
};

export const useUpdateDriver = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<DriverPayload> }) =>
      updateDriver(id, payload),
    onSuccess: () => {
      toast.success("Driver updated successfully");
      return queryClient.invalidateQueries({ queryKey: driverKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update driver");
    },
  });
};

export const useDeleteDriver = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteDriver(id),
    onSuccess: () => {
      toast.success("Driver deleted successfully");
      return queryClient.invalidateQueries({ queryKey: driverKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete driver");
    },
  });
};

export const useAssignments = (bookingId: string) => {
  return useQuery({
    queryKey: driverKeys.assignments(bookingId),
    queryFn: () => getAssignments(bookingId),
    enabled: Boolean(bookingId),
  });
};

export const useAssignDriver = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookingId, payload }: { bookingId: string; payload: AssignPayload }) =>
      assignDriver(bookingId, payload),
    onSuccess: (_, variables) => {
      toast.success("Driver assigned successfully");
      void queryClient.invalidateQueries({ queryKey: driverKeys.all });
      return queryClient.invalidateQueries({
        queryKey: driverKeys.assignments(variables.bookingId),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to assign driver");
    },
  });
};

export const useUnassignDriver = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: string) => unassignDriver(bookingId),
    onSuccess: (_, bookingId) => {
      toast.success("Driver unassigned");
      void queryClient.invalidateQueries({ queryKey: driverKeys.all });
      return queryClient.invalidateQueries({ queryKey: driverKeys.assignments(bookingId) });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to unassign driver");
    },
  });
};
