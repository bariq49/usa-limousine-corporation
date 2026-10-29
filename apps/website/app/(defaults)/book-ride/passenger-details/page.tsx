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
  const step1 = useBookingStore((s) => s.step1);
  const step2 = useBookingStore((s) => s.step2);

  useEffect(() => {
    if (!hasHydrated) return;
    if (useBookingStore.getState().checkout) {
      router.replace("/book-ride/payment-cancel");
      return;
    }
    if (!step1) {
      router.replace("/");
      return;
    }
    if (!step2) {
      router.replace("/book-ride/select-vehicle");
    }
  }, [hasHydrated, step1, step2, router]);

  if (!hasHydrated || !step1 || !step2) return null;

  return (
    <BookingStepLayout showMobileMap={false}>
      <h1 className="sr-only">Passenger Details</h1>
      <Step3 />
    </BookingStepLayout>
  );
}

export default PassengerDetailsPage;
