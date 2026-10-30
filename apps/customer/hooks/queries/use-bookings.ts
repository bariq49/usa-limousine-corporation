import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import type {
  CalendarQuery,
  CreateInput,
  Query,
} from "@usa-limousine-corporation/ui/types/booking-model";
import { downloadBlob } from "@usa-limousine-corporation/ui/utils/download";
import {
  cancelBooking,
  completeBooking,
  createBooking,
  getBooking,
  getBookingAnalytics,
  getBookingCalendar,
  getBookings,
  getReceipt,
} from "@/lib/api/bookings";

export const bookingQueryKeys = {
  all: ["bookings"] as const,
  list: (params?: Query) => ["bookings", "list", params] as const,
  detail: (id: string) => ["bookings", "detail", id] as const,
  analytics: (year: number, month: number | null) =>
    ["bookings", "analytics", year, month] as const,
};

export const useBookingAnalytics = (year: number, month: number | null) => {
  return useQuery({
    queryKey: bookingQueryKeys.analytics(year, month),
    queryFn: () => getBookingAnalytics(year, month),
  });
};

export const useBookings = (params?: Query) => {
  return useQuery({
    queryKey: bookingQueryKeys.list(params),
    queryFn: () => getBookings(params),
  });
};

export const useBooking = (id: string) => {
  return useQuery({
    queryKey: bookingQueryKeys.detail(id),
    queryFn: () => getBooking(id),
    enabled: Boolean(id),
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => cancelBooking(id, reason),
    onSuccess: () => {
      toast.success("Booking cancelled");
      return queryClient.invalidateQueries({ queryKey: bookingQueryKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to cancel booking");
    },
  });
};

export const useCompleteBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => completeBooking(id),
    onSuccess: () => {
      toast.success("Ride marked as completed");
      return queryClient.invalidateQueries({ queryKey: bookingQueryKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to complete booking");
    },
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateInput) => createBooking(body),
    onSuccess: () => {
      toast.success("Booking requested. We will confirm it shortly.");
      return queryClient.invalidateQueries({ queryKey: bookingQueryKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create booking");
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

export const useDownloadReceipt = () => {
  return useMutation({
    mutationFn: async ({ orderId, fileName }: { orderId: string; fileName: string }) => {
      const blob = await getReceipt(orderId);
      downloadBlob(blob, fileName);
    },
    onError: (error: Error) => {
      toast.error(error.message || "We could not download your receipt. Please try again.");
    },
  });
};
