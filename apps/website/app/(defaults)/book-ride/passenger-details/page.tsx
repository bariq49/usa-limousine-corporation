"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Step3 from "@/components/booking/setp-3/setp-3";
import BookingStepLayout from "@/components/booking/booking-step-layout";
import { useBookingStore } from "@/store/use-booking-store";
import { useHasHydrated } from "@/hooks/use-has-hydrated";

function PassengerDetailsPage() {
  const router = useRouter();
  const hasHydrated = useHasHydrated();
  useEffect(() => {
    if (hasHydrated && useBookingStore.getState().checkout) {
      router.replace("/book-ride/payment-cancel");
    }
  }, [hasHydrated, router]);

  return (
    <BookingStepLayout showMobileMap={false}>
      <h1 className="sr-only">Passenger Details</h1>
      <Step3 />
    </BookingStepLayout>
  );
}

export default PassengerDetailsPage;
