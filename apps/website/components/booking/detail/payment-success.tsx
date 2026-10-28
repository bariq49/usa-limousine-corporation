"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";
import { BookingDetailView } from "@usa-limousine-corporation/ui/bookings/booking-detail-view";
import { BookingDetailSkeleton } from "@usa-limousine-corporation/ui/bookings/booking-detail-skeleton";
import { useCheckoutBooking } from "@/hooks/queries/use-checkout-booking";
import { useBookingStore } from "@/store/use-booking-store";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { Download } from "@usa-limousine-corporation/ui/svg";
import API_ROUTES from "@/config/routes";
import { getApiBaseUrl } from "@/lib/api/base-url";
import PaymentNotFound from "./payment-not-found";

export default function PaymentSuccess() {
  const resetBooking = useBookingStore((s) => s.resetBooking);
  const orderId = useSearchParams().get("orderId");
  const { data: booking, isError, isFetching } = useCheckoutBooking(orderId, true);
  const isPaid = booking?.payment?.status === "PAID";
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadReceipt = async () => {
    if (!orderId || !booking) return;
    setIsDownloading(true);
    try {
      const response = await fetch(
        `${getApiBaseUrl()}${API_ROUTES.CHECKOUT}/${encodeURIComponent(orderId)}/receipt`,
      );
      if (!response.ok) throw new Error("Receipt request failed");
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = `receipt-${booking.bookingNumber}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("We could not download your receipt. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    if (isPaid) resetBooking();
  }, [isPaid, resetBooking]);

  if (!orderId || isError) return <PaymentNotFound />;
  if (!booking || booking.status === "PENDING") {
    return isFetching || !booking ? <BookingDetailSkeleton /> : <PaymentNotFound />;
  }

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
            onClick={downloadReceipt}
            isLoading={isDownloading}
            className="h-10 shrink-0 gap-1.5 px-3"
          >
            {isDownloading ? null : <Download className="h-4 w-4" />}
            <span className="hidden sm:inline">
              {isDownloading ? "Downloading..." : "Download receipt"}
            </span>
            <span className="sm:hidden">Receipt</span>
          </Button>
        ) : null
      }
    />
  );
}
