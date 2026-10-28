"use client";

import { ArrowLeftRight, ArrowRight, Plane } from "@usa-limousine-corporation/ui/svg";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { format, isValid, parseISO } from "date-fns";
import { useTimeFormat } from "@usa-limousine-corporation/ui/store/time-format";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { MeetGreetField } from "./meet-greet-field";
import { TripExtrasFields } from "./trip-extras-fields";
import { Input } from "@usa-limousine-corporation/ui/components/input";
import { useBookingStore } from "@/store/use-booking-store";
import { cn, formatPrice, formatTime } from "@/lib/utils";
import { ReturnTripModal } from "../modals/return-trip-modal";
import type { Step3FormValues } from "@/types/booking.types";

export const ReturnTripField = () => {
  const { setValue } = useFormContext<Step3FormValues>();
  const { step1, returnTrip, quote, setReturnTrip } = useBookingStore();
  const hourCycle = useTimeFormat((state) => state.hourCycle);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const returnEnabled = Boolean(returnTrip);
  const returnTotalPrice = quote?.pricing.legs?.returnTrip.total;
  const showReturnAirport = Boolean(step1?.isAirportSelected);
  const returnDate = returnTrip ? parseISO(returnTrip.returnDate) : null;

  const pickupAddress = step1?.pickupAddress?.trim() || "";
  const deliveryAddress = step1?.deliveryAddress?.trim() || "";

  const removeReturn = () => {
    setReturnTrip(null);
    setValue("returnFlightNumber", "", { shouldDirty: true });
    setValue("returnMeetGreetEnabled", false, { shouldDirty: true });
    setValue("returnMeetGreet", "", { shouldDirty: true });
    setValue("returnChildSeatsEnabled", false, { shouldDirty: true });
    setValue("returnChildSeats", [], { shouldDirty: true });
    setValue("returnNotes", "", { shouldDirty: true });
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
        <div className="min-w-0">
          {returnTrip && returnDate && isValid(returnDate) ? (
            <>
              <p className="text-xs text-gray-500">
                {format(returnDate, "EEE d MMM yyyy")} · {formatTime(returnTrip.returnTime, hourCycle)}
              </p>
              <p className="text-xl font-bold text-secondary sm:text-2xl">
                {returnTotalPrice === undefined ? "—" : formatPrice(returnTotalPrice)}
              </p>
            </>
          ) : (
            <p className="text-xs text-gray-500 sm:text-sm">
              Choose a date and time to see the return price.
            </p>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          {returnEnabled ? (
            <Button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="rounded-sm border border-border bg-white px-4 font-semibold text-gray-900 hover:bg-gray-50"
            >
              Change
            </Button>
          ) : null}
          <Button
            type="button"
            onClick={returnEnabled ? removeReturn : () => setIsModalOpen(true)}
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
      </div>

      {returnEnabled ? (
        <div className="space-y-3 border-t border-border px-4 py-4">
          <div className="flex items-center gap-2">
            <span className="h-5 w-1 shrink-0 rounded-full bg-secondary" />
            <h4 className="text-base font-semibold text-gray-900">
              Return Trip Details
            </h4>
          </div>

          {showReturnAirport ? (
            <Input
              name="returnFlightNumber"
              label="Return Flight Number"
              placeholder="e.g. LH1868"
              icon={<Plane width={16} height={16} className="text-gray-400" />}
              className="sm:max-w-sm"
            />
          ) : null}

          <MeetGreetField
            enabledField="returnMeetGreetEnabled"
            nameField="returnMeetGreet"
            label="Return Meet & Greet"
            namePlaceholder="Name for return Meet & Greet sign"
            nameLabel="Return Sign Name"
          />

          <TripExtrasFields
            childSeatsField="returnChildSeats"
            childSeatsEnabledField="returnChildSeatsEnabled"
            childSeatsLabel="Need a child seat for the return?"
            notesField="returnNotes"
            notesLabel="Add notes for the return driver"
          />
        </div>
      ) : null}

      <ReturnTripModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
