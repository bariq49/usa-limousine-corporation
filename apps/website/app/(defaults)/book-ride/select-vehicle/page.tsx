"use client";

import Setp2 from "@/components/booking/setp-2/setp-2";
import BookingStepLayout from "@/components/booking/booking-step-layout";

function SelectVehiclePage() {
  return (
    <BookingStepLayout>
      <h1 className="sr-only">Select Your Vehicle</h1>
      <Setp2 />
    </BookingStepLayout>
  );
}

export default SelectVehiclePage;
