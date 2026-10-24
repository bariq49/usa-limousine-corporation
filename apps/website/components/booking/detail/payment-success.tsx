"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { BookingDetailView } from "@usa-limousine-corporation/ui/bookings/booking-detail-view";
import { BookingDetailSkeleton } from "@usa-limousine-corporation/ui/bookings/booking-detail-skeleton";
import { useCheckoutBooking } from "@/hooks/queries/use-checkout-booking";
import { useBookingStore } from "@/store/use-booking-store";
import PaymentNotFound from "./payment-not-found";

export default function PaymentSuccess() {
  const sessionId = useSearchParams().get("session_id");
  const { data: booking, isError, isFetching } = useCheckoutBooking(sessionId, true);
  const resetBooking = useBookingStore((s) => s.resetBooking);
  const isPaid = booking?.payment?.status === "PAID";

  useEffect(() => {
    if (isPaid) resetBooking();
  }, [isPaid, resetBooking]);

  if (!sessionId || isError) return <PaymentNotFound />;
  if (!booking || booking.status === "PENDING") {
    return isFetching || !booking ? <BookingDetailSkeleton /> : <PaymentNotFound />;
  }

  return (
    <BookingDetailView booking={booking} backHref="/" mapStickyClassName="max-lg:top-safe-header" />
  );
}
