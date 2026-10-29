"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import BookingStepLayout from "@usa-limousine-corporation/ui/components/bookings/booking-step-layout";
import Step2 from "@usa-limousine-corporation/ui/components/bookings/step-2";
import { useBookingStore } from "@usa-limousine-corporation/ui/store/booking";
import { useHasHydrated } from "@usa-limousine-corporation/ui/hooks/use-booking";

function SelectVehiclePage() {
  const router = useRouter();
  const hasHydrated = useHasHydrated();
  const step1 = useBookingStore((s) => s.step1);

  useEffect(() => {
    if (hasHydrated && !step1) {
      router.replace("/");
    }
  }, [hasHydrated, step1, router]);

  if (!hasHydrated || !step1) return null;

  return (
    <BookingStepLayout>
      <h1 className="sr-only">Select Your Vehicle</h1>
      <Step2 />
    </BookingStepLayout>
  );
}

export default SelectVehiclePage;
