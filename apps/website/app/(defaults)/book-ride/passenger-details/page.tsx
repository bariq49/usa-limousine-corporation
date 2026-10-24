"use client";

import Step3 from "@/components/booking/setp-3/setp-3";
import BookingStepLayout from "@/components/booking/booking-step-layout";

function PassengerDetailsPage() {
  return (
    <BookingStepLayout showMobileMap={false}>
      <h1 className="sr-only">Passenger Details</h1>
      <Step3 />
    </BookingStepLayout>
  );
}

export default PassengerDetailsPage;
