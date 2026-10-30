import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CalendarQuery } from "@usa-limousine-corporation/ui/types/booking-model";
import toast from "react-hot-toast";
import {
  bulkDeleteBookings,
  cancelBooking,
  completeBooking,
  confirmBooking,
  deleteBooking,
  getBooking,
  getBookingAnalytics,
  getBookingCalendar,
  getBookings,
} from "../../lib/api/bookings";
import type { Query } from "../../lib/types/bookings";

export const bookingKeys = {
  all: ["bookings"] as const,
  list: (params?: Query) => [...bookingKeys.all, "list", params] as const,
  detail: (id: string) => [...bookingKeys.all, "detail", id] as const,
  analytics: (year: number, userId?: string, month?: number | null) =>
    ["bookings", "analytics", year, userId ?? "all", month ?? "all"] as const,
};

export const useBookings = (params?: Query, enabled = true) => {
  return useQuery({
    queryKey: bookingKeys.list(params),
    queryFn: () => getBookings(params),
    enabled,
  });
};

/** Platform-wide stats, or one customer's when `userId` is given. */
export const useBookingAnalytics = (
  year: number,
  options?: {
    userId?: string | undefined;
    month?: number | null | undefined;
    enabled?: boolean | undefined;
  },
) => {
  const userId = options?.userId;
  const month = options?.month ?? null;
  return useQuery({
    queryKey: bookingKeys.analytics(year, userId, month),
    queryFn: () => getBookingAnalytics(year, { userId, month }),
    enabled: options?.enabled ?? true,
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

/** Calendar events for the visible range; waits until the calendar reports one. */
export const useBookingCalendar = (query: CalendarQuery | null) => {
  return useQuery({
    queryKey: ["bookings", "calendar", query] as const,
    queryFn: () => getBookingCalendar(query as CalendarQuery),
    enabled: Boolean(query),
    placeholderData: keepPreviousData,
  });
};
