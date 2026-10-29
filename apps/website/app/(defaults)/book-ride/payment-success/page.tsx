import { Suspense } from "react";
import type { Metadata } from "next";
import PaymentSuccess from "@/components/booking/detail/payment-success";
import { BookingDetailSkeleton } from "@usa-limousine-corporation/ui/components/bookings/booking-detail-skeleton";

export const metadata: Metadata = {
  title: "Booking Confirmation",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <Suspense fallback={<BookingDetailSkeleton />}>
        <PaymentSuccess />
      </Suspense>
    </div>
  );
}
