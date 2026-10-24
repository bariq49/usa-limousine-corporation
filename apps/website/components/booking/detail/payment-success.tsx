"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BookingDetailView } from "@usa-limousine-corporation/ui/bookings/booking-detail-view";
import { BookingDetailSkeleton } from "@usa-limousine-corporation/ui/bookings/booking-detail-skeleton";
import { useCheckoutBooking } from "@/hooks/queries/use-checkout-booking";
import { useBookingStore } from "@/store/use-booking-store";
import { useHasHydrated } from "@/hooks/use-has-hydrated";
import PaymentNotFound from "./payment-not-found";

export default function PaymentSuccess() {
  const hasHydrated = useHasHydrated();
  const checkout = useBookingStore((s) => s.checkout);
  const resetBooking = useBookingStore((s) => s.resetBooking);
  const router = useRouter();
  const urlOrderId = useSearchParams().get("orderId");
  const orderId = urlOrderId ?? checkout?.orderId;
  const { data: booking, isError, isFetching } = useCheckoutBooking(orderId, true);
  const isPaid = booking?.payment?.status === "PAID";

  useEffect(() => {
    if (!isPaid || !orderId) return;
    if (urlOrderId) {
      resetBooking();
    } else {
      router.replace(`/book-ride/payment-success?orderId=${encodeURIComponent(orderId)}`);
    }
  }, [isPaid, orderId, urlOrderId, resetBooking, router]);

  if (!hasHydrated) return <BookingDetailSkeleton />;
  if (!orderId || isError) return <PaymentNotFound />;
  if (!booking || booking.status === "PENDING") {
    return isFetching || !booking ? <BookingDetailSkeleton /> : <PaymentNotFound />;
  }

  return (
    <BookingDetailView booking={booking} backHref="/" mapStickyClassName="max-lg:top-safe-header" />
  );
}
