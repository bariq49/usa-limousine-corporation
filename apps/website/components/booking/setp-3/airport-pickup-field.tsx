"use client";

import { Plane } from "@usa-limousine-corporation/ui/svg";
import { Input } from "@usa-limousine-corporation/ui/components/input";
import { useBookingStore } from "@/store/use-booking-store";
import type { Step3FormValues } from "@/types/booking.types";

type Props = {
  airlineField?: keyof Pick<Step3FormValues, "airlineName" | "returnAirlineName">;
  flightField?: keyof Pick<Step3FormValues, "flightNumber" | "returnFlightNumber">;
  airlinePlaceholder?: string;
  flightPlaceholder?: string;
  requireAirport?: boolean;
};

export const AirportPickupField = (props: Props = {}) => {
  const {
    airlineField = "airlineName",
    flightField = "flightNumber",
    airlinePlaceholder = "Airline Name (e.g. Emirates)",
    flightPlaceholder = "Flight Number (e.g. EK001)",
    requireAirport = true,
  } = props;

  const { step1 } = useBookingStore();

  if (requireAirport && !step1?.isAirportSelected) return null;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          icon={<Plane width={16} height={16} className="text-gray-400" />}
          name={airlineField}
          type="text"
          placeholder={airlinePlaceholder}
          required
          className="bg-white border-border"
        />
        <Input
          icon={<Plane width={16} height={16} className="text-gray-400" />}
          name={flightField}
          type="text"
          placeholder={flightPlaceholder}
          required
          className="bg-white border-border"
        />
      </div>
    </div>
  );
};
