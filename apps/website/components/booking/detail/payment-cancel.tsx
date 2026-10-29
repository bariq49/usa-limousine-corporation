"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BookingDetailSkeleton } from "@usa-limousine-corporation/ui/components/bookings/booking-detail-skeleton";
import { useBookingStore } from "@usa-limousine-corporation/ui/store/booking";
import { useHasHydrated } from "@usa-limousine-corporation/ui/hooks/use-booking";

export default function PaymentCancel() {
  const router = useRouter();
  const hasHydrated = useHasHydrated();
  const searchParams = useSearchParams();
  const checkout = useBookingStore((s) => s.checkout);
  const orderId = checkout?.orderId ?? searchParams.get("orderId");

  useEffect(() => {
    if (!hasHydrated) return;
    const params = orderId ? `?orderId=${encodeURIComponent(orderId)}` : "";
    router.replace(`/book-ride/payment-pending${params}`);
  }, [hasHydrated, orderId, router]);

  return <BookingDetailSkeleton />;
}
