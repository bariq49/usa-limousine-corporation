import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  bulkDeleteBookings,
  cancelBooking,
  completeBooking,
  confirmBooking,
  deleteBooking,
  getBooking,
  getBookings,
} from "../../lib/api/bookings";
import type { Query } from "../../lib/types/bookings";

export const bookingKeys = {
  all: ["bookings"] as const,
  list: (params?: Query) => [...bookingKeys.all, "list", params] as const,
  detail: (id: string) => [...bookingKeys.all, "detail", id] as const,
};

export const useBookings = (params?: Query) => {
  return useQuery({
    queryKey: bookingKeys.list(params),
    queryFn: () => getBookings(params),
  });
};

export const useBooking = (id: string) => {
  return useQuery({
    queryKey: bookingKeys.detail(id),
    queryFn: () => getBooking(id),
    enabled: Boolean(id),
  });
};

export const useConfirmBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => confirmBooking(id),
    onSuccess: () => {
      toast.success("Booking confirmed successfully");
      return queryClient.invalidateQueries({ queryKey: bookingKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to confirm booking");
    },
  });
};

export const useCompleteBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => completeBooking(id),
    onSuccess: () => {
      toast.success("Booking marked as completed");
      return queryClient.invalidateQueries({ queryKey: bookingKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to complete booking");
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => cancelBooking(id, reason),
    onSuccess: () => {
      toast.success("Booking cancelled successfully");
      return queryClient.invalidateQueries({ queryKey: bookingKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to cancel booking");
    },
  });
};

export const useDeleteBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteBooking(id),
    onSuccess: () => {
      toast.success("Booking deleted successfully");
      return queryClient.invalidateQueries({ queryKey: bookingKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete booking");
    },
  });
};

export const useBulkDeleteBookings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteBookings(ids),
    onSuccess: () => {
      toast.success("Bookings deleted successfully");
      return queryClient.invalidateQueries({ queryKey: bookingKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete bookings");
    },
  });
};
