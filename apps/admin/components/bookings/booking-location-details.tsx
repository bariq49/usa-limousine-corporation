"use client";

import { Clock } from "lucide-react";
import { Calendar, Location } from "@usa-limousine-corporation/ui/svg";

type Props = {
  pickupLocation?: string | undefined;
  dropoffLocation?: string | undefined;
  isHourly?: boolean | undefined;
  durationLabel?: string | null | undefined;
};

export function BookingLocationDetails(props: Props) {
  const { pickupLocation = "—", dropoffLocation = "—", isHourly = false, durationLabel } = props;

  return (
    <section className="flex flex-col justify-center rounded-md bg-default-100 p-5 sm:p-6">
      <h3 className="font-bold text-default-900">
        {isHourly ? "Pickup & Duration" : "Pickup & Drop-off"}
      </h3>
      <div className="mt-4 space-y-5 sm:mt-5 sm:space-y-6">
        <div className="relative grid grid-cols-[20px_minmax(0,1fr)] gap-3.5">
          <Location className="h-5 w-5 text-default-900" />
          <div
            aria-hidden
            className="absolute -bottom-5 left-[8.5px] top-6 w-[3px] bg-default-300"
          />
          <div className="min-w-0">
            <p className="text-xs font-medium text-default-500">Pickup Location</p>
            <p className="mt-0.5 text-sm font-semibold leading-snug text-default-900">
              {pickupLocation}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-[20px_minmax(0,1fr)] gap-3.5">
          {isHourly ? (
            <Clock className="h-5 w-5 text-default-900" />
          ) : (
            <Calendar className="h-5 w-5 text-default-900" />
          )}
          <div className="min-w-0">
            <p className="text-xs font-medium text-default-500">
              {isHourly ? "Hourly Duration" : "Drop-off Location"}
            </p>
            <p className="mt-0.5 text-sm font-semibold leading-snug text-default-900">
              {isHourly ? durationLabel || "—" : dropoffLocation}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
