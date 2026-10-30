"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BookingDetailView } from "@usa-limousine-corporation/ui/components/bookings/booking-detail-view";
import { BookingDetailSkeleton } from "@usa-limousine-corporation/ui/components/bookings/booking-detail-skeleton";
import { useBookingStore } from "@usa-limousine-corporation/ui/store/booking";
import { useBooking, useDownloadReceipt } from "@usa-limousine-corporation/ui/hooks/use-booking";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { Download } from "@usa-limousine-corporation/ui/svg";
import PaymentNotFound from "./payment-not-found";

export default function PaymentSuccess() {
  const router = useRouter();
  const resetBooking = useBookingStore((s) => s.resetBooking);
  const orderId = useSearchParams().get("orderId");
  const { data: booking, isError, isLoading } = useBooking(orderId);
  const downloadReceipt = useDownloadReceipt();
  const isPaid = booking?.payment?.status === "PAID";

  useEffect(() => {
    if (isPaid) resetBooking();
  }, [isPaid, resetBooking]);

  useEffect(() => {
    if (!booking || booking.status !== "PENDING" || !orderId) return;
    router.replace(`/book-ride/payment-pending?orderId=${encodeURIComponent(orderId)}`);
  }, [booking, orderId, router]);

  if (!orderId || isError) return <PaymentNotFound />;
  if (isLoading || !booking || booking.status === "PENDING") return <BookingDetailSkeleton />;

  const hasReceipt =
    booking.payment?.status === "PAID" || booking.payment?.status === "REFUNDED";

  return (
    <BookingDetailView
      booking={booking}
      backHref="/"
      mapStickyClassName="max-lg:top-safe-header"
      actions={
        hasReceipt ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              downloadReceipt.mutate({
                orderId,
                fileName: `receipt-${booking.bookingNumber}.pdf`,
              })
            }
            isLoading={downloadReceipt.isPending}
            className="h-10 shrink-0 gap-1.5 px-3"
          >
            {downloadReceipt.isPending ? null : <Download className="h-4 w-4" />}
            <span className="hidden sm:inline">
              {downloadReceipt.isPending ? "Downloading..." : "Download receipt"}
            </span>
            <span className="sm:hidden">Receipt</span>
          </Button>
        ) : null
      }
    />
  );
}
