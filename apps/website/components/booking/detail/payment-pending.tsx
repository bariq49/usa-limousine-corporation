"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BookingDetailView } from "@usa-limousine-corporation/ui/components/bookings/booking-detail-view";
import { BookingDetailSkeleton } from "@usa-limousine-corporation/ui/components/bookings/booking-detail-skeleton";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { useBookingStore } from "@usa-limousine-corporation/ui/store/booking";
import { useBooking, useHasHydrated } from "@usa-limousine-corporation/ui/hooks/use-booking";
import PaymentNotFound from "./payment-not-found";

export default function PaymentPending() {
  const hasHydrated = useHasHydrated();
  const searchParams = useSearchParams();
  const checkout = useBookingStore((s) => s.checkout);
  const setCheckout = useBookingStore((s) => s.setCheckout);
  const orderId = checkout?.orderId ?? searchParams.get("orderId");
  const { data: booking, isLoading, isError } = useBooking(orderId);

  if (!hasHydrated || isLoading) return <BookingDetailSkeleton />;
  if (!orderId || isError || !booking) {
    return (
      <PaymentNotFound
        title="No pending payment found"
        description="Start a new booking when you are ready, or check your email if you already paid."
        actionHref="/"
        actionLabel="Start a new booking"
      />
    );
  }

  const isPending = booking.status === "PENDING";
  const paymentUrl = checkout?.url;

  return (
    <BookingDetailView
      booking={booking}
      backHref="/"
      mapStickyClassName="max-lg:top-safe-header"
      heading={
        isPending
          ? {
              title: "Payment Pending",
              description:
                "Your booking is saved and waiting for payment. Complete payment to confirm your ride.",
            }
          : undefined
      }
      actions={
        <>
          {isPending && paymentUrl ? (
            <Button asChild className="h-10 bg-black px-4 text-white hover:bg-black/90">
              <a href={paymentUrl}>Complete Payment</a>
            </Button>
          ) : null}
          {isPending ? (
            <Button asChild variant="outline" className="h-10 px-4">
              <Link href="/book-ride/passenger-details" onClick={() => setCheckout(null)}>
                Edit Booking
              </Link>
            </Button>
          ) : null}
        </>
      }
    />
  );
}
