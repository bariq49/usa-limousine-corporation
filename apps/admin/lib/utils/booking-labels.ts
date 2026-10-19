import type { BookingStatus, BookingType } from "@/lib/types/bookings";

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  DRAFT: "Draft",
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const BOOKING_TYPE_LABELS: Record<BookingType, string> = {
  ONE_WAY: "One Way",
  RETURN: "Return",
  HOURLY: "Hourly",
  CREW_RIDE: "Crew Ride",
};

export const BOOKING_STATUS_HEADINGS: Record<BookingStatus, string> = {
  DRAFT: "Booking Draft",
  PENDING: "Booking Pending Confirmation",
  CONFIRMED: "Booking Confirmed",
  COMPLETED: "Booking Completed",
  CANCELLED: "Booking Cancelled",
};

export const BOOKING_STATUS_DESCRIPTIONS: Record<BookingStatus, string> = {
  DRAFT: "This booking is still a draft and has not been submitted.",
  PENDING: "This booking request is pending confirmation.",
  CONFIRMED: "This booking has been confirmed and scheduled.",
  COMPLETED: "This ride has been completed successfully.",
  CANCELLED: "This booking has been cancelled.",
};

export function bookingStatusBadgeColor(status: BookingStatus) {
  switch (status) {
    case "CONFIRMED":
      return "success" as const;
    case "PENDING":
      return "warning" as const;
    case "COMPLETED":
      return "info" as const;
    case "CANCELLED":
      return "destructive" as const;
    default:
      return "secondary" as const;
  }
}
