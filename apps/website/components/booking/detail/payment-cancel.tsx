"use client";

import Link from "next/link";
import { BookingDetailView } from "@usa-limousine-corporation/ui/bookings/booking-detail-view";
import { BookingDetailSkeleton } from "@usa-limousine-corporation/ui/bookings/booking-detail-skeleton";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { useCheckoutBooking } from "@/hooks/queries/use-checkout-booking";
import { useBookingStore } from "@/store/use-booking-store";
import { useHasHydrated } from "@/hooks/use-has-hydrated";
import PaymentNotFound from "./payment-not-found";

export default function PaymentCancel() {
  const hasHydrated = useHasHydrated();
  const checkout = useBookingStore((s) => s.checkout);
  const { data: booking, isLoading, isError } = useCheckoutBooking(checkout?.sessionId);

  if (!hasHydrated || isLoading) return <BookingDetailSkeleton />;
  if (!checkout || isError || !booking) return <PaymentNotFound />;

  const isPending = booking.status === "PENDING";

  return (
    <BookingDetailView
      booking={booking}
      backHref="/book-ride/passenger-details"
      mapStickyClassName="max-lg:top-safe-header"
      heading={
        isPending
          ? {
              title: "Payment Cancelled",
              description: "Your payment was cancelled or not completed. No charges were made.",
            }
          : undefined
      }
      actions={
        isPending ? (
          <Button asChild className="h-10 bg-black px-4 text-white hover:bg-black/90">
            <a href={checkout.url}>Complete Payment</a>
          </Button>
        ) : (
          <Button asChild variant="outline" className="h-10 px-4">
            <Link href="/book-ride/passenger-details">Edit Booking</Link>
          </Button>
        )
      }
    />
  );
}
