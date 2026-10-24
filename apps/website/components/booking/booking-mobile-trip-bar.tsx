"use client";

import { Check, Clock, Location } from "@usa-limousine-corporation/ui/svg";
import { useBookingStore } from "@/store/use-booking-store";
import { formatDistance, formatHrs } from "@/lib/utils";
import { TRIP_TYPES } from "@/constants/booking-constants";

type Prop = {
  pricingLabel: string;
  leftAction: React.ReactNode;
};

export default function BookingMobileTripBar(prop: Prop) {
  const { pricingLabel, leftAction } = prop;
  const step1 = useBookingStore((s) => s.step1);
  const isHourly = step1?.tripType === TRIP_TYPES.HOURLY;

  const tripMeta = isHourly
    ? step1?.duration
      ? formatHrs(Number(step1.duration))
      : null
    : formatDistance(step1?.distance);

  const MetaIcon = isHourly ? Clock : Location;

  return (
    <div className="w-full px-3 py-3 md:px-4 lg:py-3">
      <div className="flex items-center gap-2 sm:grid sm:grid-cols-sides sm:gap-x-4">
        <div className="min-w-0 shrink-0 sm:justify-self-start">{leftAction}</div>

        <div className="flex min-w-0 flex-1 items-center justify-center gap-1.5 sm:flex-none sm:gap-2 sm:px-0">
          <Check className="h-3.5 w-3.5 shrink-0 text-secondary sm:h-4 sm:w-4" strokeWidth={2.5} />
          <p className="truncate text-center text-caption font-medium leading-snug text-gray-700 sm:text-sm sm:leading-normal sm:whitespace-nowrap">
            {pricingLabel}
          </p>
        </div>

        <div className="shrink-0 sm:justify-self-end">
          {tripMeta ? (
            <span className="inline-flex items-center gap-1 text-caption font-semibold text-secondary whitespace-nowrap sm:gap-1.5 sm:text-sm">
              <MetaIcon className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" strokeWidth={2.5} />
              {tripMeta}
            </span>
          ) : (
            <span className="invisible inline-flex text-caption sm:text-sm" aria-hidden>
              —
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
