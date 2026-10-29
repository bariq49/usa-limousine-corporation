import { Suspense } from "react";
import type { Metadata } from "next";
import PaymentCancel from "@/components/booking/detail/payment-cancel";
import { BookingDetailSkeleton } from "@usa-limousine-corporation/ui/components/bookings/booking-detail-skeleton";

export const metadata: Metadata = {
  title: "Payment Cancelled",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <Suspense fallback={<BookingDetailSkeleton />}>
        <PaymentCancel />
      </Suspense>
    </div>
  );
}
