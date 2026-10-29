"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Setp2 from "@/components/booking/setp-2/setp-2";
import BookingStepLayout from "@/components/booking/booking-step-layout";
import { useBookingStore } from "@/store/use-booking-store";
import { useHasHydrated } from "@/hooks/use-has-hydrated";

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
      <Setp2 />
    </BookingStepLayout>
  );
}

export default SelectVehiclePage;
