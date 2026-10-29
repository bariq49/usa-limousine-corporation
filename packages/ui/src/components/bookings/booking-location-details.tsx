"use client";

import { Clock, Location } from "../../svg";
import { cn } from "../../utils/cn";
import type {
  BookingLocationDetailsProps,
  BookingLocationPoint,
} from "../../types/bookings";

export function BookingLocationDetails(props: BookingLocationDetailsProps) {
  const { isHourly = false, stops = [], variant = "card" } = props;
  const isCard = variant === "card";
  const pickup: BookingLocationPoint = {
    label: "Pickup Location",
    value: props.pickupLocation || "—",
    time: props.pickupTime,
  };
  const stopPoints: BookingLocationPoint[] = stops.map((stop, index) => ({
    label: `Stop ${index + 1}`,
    value: stop,
  }));
  const last: BookingLocationPoint = isHourly
    ? {
        label: "Hourly Duration",
        value: props.durationLabel || "—",
        hint: "Dedicated chauffeur for your selected hours",
      }
    : {
        label: "Drop-off Location",
        value: props.dropoffLocation || "—",
        time: props.dropoffTime,
      };
  const points = [pickup].concat(stopPoints, [last]);

  return (
    <section
      className={cn(
        "flex flex-col justify-center",
        isCard && "rounded-md bg-default-100 p-5 sm:p-6",
        props.className,
      )}
    >
      {isCard ? (
        <h3 className="mb-4 font-bold text-default-900 sm:mb-5">
          {isHourly ? "Pickup & Duration" : "Pickup & Drop-off"}
        </h3>
      ) : null}
      {isCard ? null : (
        <ol>
          {points.map((point, index) => {
            const isLast = index === points.length - 1;
            const comma = point.value.indexOf(",");
            const title = comma > -1 ? point.value.slice(0, comma) : point.value;
            const subtitle = point.hint ?? (comma > -1 ? point.value.slice(comma + 1).trim() : "");
            return (
              <li key={`${point.label}-${index}`} className="flex gap-3">
                <div className="relative flex w-2 shrink-0 justify-center">
                  <span
                    className={cn(
                      "relative z-10 mt-1.5 h-2 w-2 rounded-xs",
                      index === 0 ? "bg-default-900" : isLast ? "bg-primary" : "bg-default-400",
                    )}
                  />
                  {isLast ? null : (
                    <span
                      aria-hidden
                      className="absolute bottom-0 left-1/2 top-3.5 w-px -translate-x-1/2 bg-default-300"
                    />
                  )}
                </div>
                <div className={cn("min-w-0 flex-1", !isLast && "pb-4")}>
                  <p className="text-sm font-bold leading-snug text-default-900">{title}</p>
                  {subtitle || point.time ? (
                    <div className="mt-0.5 flex items-start justify-between gap-3">
                      <p className="min-w-0 text-xs font-medium text-default-500">{subtitle}</p>
                      {point.time ? (
                        <p className="shrink-0 whitespace-nowrap text-xs text-default-600">
                          {point.time}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                  {index === 0 && props.note ? (
                    <p className="mt-3 text-xs text-default-500">{props.note}</p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      )}
      {isCard ? (
        <ol className="space-y-5 sm:space-y-6">
          {points.map((point, index) => {
            const isLast = index === points.length - 1;
            const Icon = isLast && isHourly ? Clock : Location;
            return (
              <li key={`${point.label}-${index}`} className="relative flex gap-3.5">
                <Icon className="h-5 w-5 shrink-0 text-default-900" />
                {isLast ? null : (
                  <span
                    aria-hidden
                    className="absolute -bottom-5 left-2 top-6 w-0.75 overflow-hidden bg-default-300 sm:-bottom-6"
                  >
                    <span className="booking-location-dot absolute -left-0.75 h-2.5 w-2.5 rounded-full bg-primary" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-default-500">{point.label}</p>
                  <p className="mt-0.5 text-sm font-semibold leading-snug text-default-900">
                    {point.value}
                  </p>
                  {point.hint ? (
                    <p className="mt-0.5 text-xs text-default-500">{point.hint}</p>
                  ) : null}
                  {index === 0 && props.note ? (
                    <p className="mt-1.5 text-xs font-medium text-default-500">{props.note}</p>
                  ) : null}
                </div>
                {point.time ? (
                  <p className="shrink-0 whitespace-nowrap pt-0.5 text-sm font-semibold text-default-900">
                    {point.time}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ol>
      ) : null}
      <style>{`
        .booking-location-dot { animation: booking-location-dot 2.2s linear infinite; }
        @keyframes booking-location-dot {
          0% { top: 0; opacity: 0; }
          15%, 85% { opacity: 1; }
          100% { top: calc(100% - 0.625rem); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .booking-location-dot { animation: none; top: 40%; }
        }
      `}</style>
    </section>
  );
}
