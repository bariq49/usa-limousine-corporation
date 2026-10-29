"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import BookingStepLayout from "@usa-limousine-corporation/ui/components/bookings/booking-step-layout";
import Step3 from "@usa-limousine-corporation/ui/components/bookings/step-3";
import { useBookingStore } from "@usa-limousine-corporation/ui/store/booking";
import { useHasHydrated } from "@usa-limousine-corporation/ui/hooks/use-booking";

function PassengerDetailsPage() {
  const router = useRouter();
  const hasHydrated = useHasHydrated();
  const step1 = useBookingStore((s) => s.step1);
  const step2 = useBookingStore((s) => s.step2);

  useEffect(() => {
    if (!hasHydrated) return;
    if (useBookingStore.getState().checkout) {
      router.replace("/book-ride/payment-pending");
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
