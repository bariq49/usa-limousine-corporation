"use client";

import { ArrowLeftRight, ArrowRight, Calendar, Clock } from "@usa-limousine-corporation/ui/svg";
import { useFormContext, useWatch } from "react-hook-form";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { Input } from "@usa-limousine-corporation/ui/components/input";
import { MeetGreetField } from "./meet-greet-field";
import { TripExtrasFields } from "./trip-extras-fields";
import { AirportPickupField } from "./airport-pickup-field";
import { useBookingStore } from "@/store/use-booking-store";
import { cn, formatPrice } from "@/lib/utils";
import type { Step3FormValues } from "@/types/booking.types";

export const ReturnTripField = () => {
  const { control, setValue } = useFormContext<Step3FormValues>();
  const { step1, step2 } = useBookingStore();

  const returnEnabled = useWatch({ control, name: "returnEnabled" });
  const pickupDate = useWatch({ control, name: "pickupDate" });
  const returnTotalPrice = step2?.vehicleCategory?.priceBreakdown?.returnTotalPrice ?? 0;
  const showReturnAirport = Boolean(step1?.isAirportSelected);

  const pickupAddress = step1?.pickupAddress?.trim() || "";
  const deliveryAddress = step1?.deliveryAddress?.trim() || "";

  const addReturn = () => {
    setValue("returnEnabled", true, { shouldDirty: true });
  };

  const removeReturn = () => {
    setValue("returnEnabled", false, { shouldDirty: true });
    setValue("returnDate", "", { shouldDirty: true });
    setValue("returnTime", "", { shouldDirty: true });
    setValue("returnAirlineName", "", { shouldDirty: true });
    setValue("returnFlightNumber", "", { shouldDirty: true });
    setValue("returnMeetGreetEnabled", false, { shouldDirty: true });
    setValue("returnMeetGreet", "", { shouldDirty: true });
    setValue("returnChildSeatsEnabled", false, { shouldDirty: true });
    setValue("returnChildSeats", [], { shouldDirty: true });
  };


  return (
    <div className="rounded-sm border border-border bg-white">
      <div className="flex items-start gap-3 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-gray-900 text-white">
          <ArrowLeftRight className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-gray-900 sm:text-base">
            Heading back to {pickupAddress}?
          </p>
          <p className="mt-1 text-xs text-gray-500 sm:text-sm">
            Add your return transfer from:
          </p>
          <div className="mt-1.5 flex min-w-0 items-center gap-1.5 text-xs font-medium text-gray-800 sm:text-sm">
            <span className="min-w-0 truncate">{deliveryAddress}</span>
            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-secondary" />
            <span className="min-w-0 truncate">{pickupAddress}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
        <div>
          <p className="text-xs text-gray-500">Additional cost</p>
          <p className="text-xl font-bold text-secondary sm:text-2xl">
            {formatPrice(returnTotalPrice)}
          </p>
        </div>
        <Button
          type="button"
          onClick={returnEnabled ? removeReturn : addReturn}
          className={cn(
            "rounded-sm px-5 font-semibold",
            returnEnabled
              ? "border border-gray-900 bg-white text-gray-900 hover:bg-gray-50"
              : "bg-gray-900 text-white hover:bg-gray-800"
          )}
        >
          {returnEnabled ? "Remove" : "Add Return"}
        </Button>
      </div>

      {returnEnabled ? (
        <div className="space-y-3 border-t border-border px-4 py-4">
          <div className="flex items-center gap-2">
            <span className="h-5 w-1 shrink-0 rounded-full bg-secondary" />
            <h4 className="text-base font-semibold text-gray-900">
              Return Trip Details
            </h4>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              name="returnDate"
              type="date"
              placeholder="Select return date"
              icon={<Calendar width={16} height={16} className="text-gray-400" />}
              disablePast
              minDate={pickupDate || undefined}
              required
            />
            <Input
              name="returnTime"
              type="time"
              placeholder="Select return time"
              icon={<Clock width={16} height={16} className="text-gray-400" />}
              required
            />
          </div>

          {showReturnAirport ? (
            <AirportPickupField
              airlineField="returnAirlineName"
              flightField="returnFlightNumber"
              airlinePlaceholder="Return Airline Name (e.g. Emirates)"
              flightPlaceholder="Return Flight Number (e.g. EK001)"
              requireAirport={false}
            />
          ) : null}

          <MeetGreetField
            enabledField="returnMeetGreetEnabled"
            nameField="returnMeetGreet"
            label="Return Meet & Greet"
            namePlaceholder="Name for return Meet & Greet sign"
          />

          <TripExtrasFields
            childSeatsField="returnChildSeats"
            childSeatsEnabledField="returnChildSeatsEnabled"
            childSeatsLabel="Return Child Seats"
            showNotes={false}
          />
        </div>
      ) : null}
    </div>
  );
};
