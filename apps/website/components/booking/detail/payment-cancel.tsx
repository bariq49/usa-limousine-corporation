"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BookingDetailView } from "@usa-limousine-corporation/ui/bookings/booking-detail-view";
import { BookingDetailSkeleton } from "@usa-limousine-corporation/ui/bookings/booking-detail-skeleton";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { useCheckoutBooking } from "@/hooks/queries/use-checkout-booking";
import { useBookingStore } from "@/store/use-booking-store";
import { useHasHydrated } from "@/hooks/use-has-hydrated";
import PaymentNotFound from "./payment-not-found";

export default function PaymentCancel() {
  const hasHydrated = useHasHydrated();
  const searchParams = useSearchParams();
  const checkout = useBookingStore((s) => s.checkout);
  const setCheckout = useBookingStore((s) => s.setCheckout);
  const orderId = checkout?.orderId ?? searchParams.get("orderId");
  const { data: booking, isLoading, isError } = useCheckoutBooking(orderId);

  if (!hasHydrated || isLoading) return <BookingDetailSkeleton />;
  if (!orderId || isError || !booking) {
    return (
      <PaymentNotFound
        title="Payment was cancelled"
        description="No charges were made. Start a new booking when you are ready."
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
              title: "Payment Cancelled",
              description: "Your payment was cancelled or not completed. No charges were made.",
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
          <Button asChild variant="outline" className="h-10 px-4">
            <Link href="/book-ride/passenger-details" onClick={() => setCheckout(null)}>
              Edit Booking
            </Link>
          </Button>
        </>
      }
    />
  );
}
