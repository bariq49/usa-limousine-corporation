"use client";

import { Clock, Location } from "../svg";
import { cn } from "../utils/cn";

export type RouteAddress = {
  name: string;
  detail?: string;
};

type TripRouteDetailsProps = {
  pickup: RouteAddress;
  delivery: RouteAddress;
  stops?: RouteAddress[];
  serviceType?: string;
  dateValue?: string;
  pickupTime?: string;
  deliveryTime?: string;
  hireDuration?: string | null;
  estDistance?: string | null;
  estDuration?: string | null;
  showAnimation?: boolean;
  showTripMeta?: boolean;
  className?: string;
};

export function TripRouteDetails({
  pickup,
  delivery,
  stops = [],
  serviceType,
  dateValue,
  pickupTime,
  deliveryTime,
  hireDuration,
  estDistance,
  estDuration,
  showAnimation = true,
  showTripMeta = false,
  className,
}: TripRouteDetailsProps) {
  const showPickupTime = Boolean(pickupTime?.trim());
  const showDeliveryTime = Boolean(deliveryTime?.trim());
  const showHireDuration = Boolean(hireDuration?.trim());

  return (
    <div className={cn("relative pl-9", className)}>
      {showTripMeta ? (
        <div className="mb-4 -ml-9 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Service</span>
            <span className="text-sm font-normal text-gray-500">
              {serviceType || "Airport Transfer"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Date</span>
            <span className="text-right text-sm font-normal text-gray-500">{dateValue || "—"}</span>
          </div>
        </div>
      ) : null}

      <div
        className={cn(
          "absolute left-3.5 bottom-6.25 z-0 w-1 overflow-visible bg-gray-200",
          showTripMeta ? "top-19.5" : "top-6",
        )}
      >
        {showAnimation ? (
          <div
            className="absolute left-1.75 z-10 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-secondary"
            style={{ animation: "tripRouteMoveDown 3.5s linear infinite" }}
          />
        ) : null}
      </div>

      <div className="relative mb-5">
        <div className="absolute -left-7.5 top-1.5 z-10 h-5 w-5 rounded-full border-4 border-secondary bg-white" />
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-medium leading-tight text-gray-800 sm:text-body">
              {pickup.name || "Pickup location"}
            </h3>
            <p className="truncate text-sm font-normal leading-relaxed text-gray-500">
              {pickup.detail || "Full address not specified"}
            </p>
            {(estDistance || estDuration) && (
              <div className="mt-2 flex items-center gap-2">
                {estDuration && (
                  <span className="inline-flex items-center rounded-sm border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-3xs font-medium lowercase text-gray-500 shadow-sm">
                    ~ {estDuration}
                  </span>
                )}
                {estDistance && (
                  <span className="inline-flex items-center rounded-sm border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-3xs font-medium text-gray-500 shadow-sm">
                    ~ {estDistance}
                  </span>
                )}
              </div>
            )}
          </div>
          <span className="whitespace-nowrap pt-1 text-sm font-normal text-gray-500">
            {showPickupTime ? pickupTime : "—"}
          </span>
        </div>
      </div>

      {stops.map((stop, idx) => (
        <div key={`${stop.name}-${idx}`} className="relative mb-5">
          <div className="absolute -left-6.25 top-2 z-10 h-2.5 w-2.5 rounded-full border-2 border-white bg-gray-300" />
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-medium leading-tight text-gray-800 sm:text-body">
                {stop.name || `Stop ${idx + 1}`}
              </h3>
              <p className="mt-0.5 truncate text-sm font-normal leading-relaxed text-gray-500">
                {stop.detail || ""}
              </p>
            </div>
          </div>
        </div>
      ))}

      <div className="relative">
        <div className="absolute -left-7.75 top-0.5 z-10">
          <Location className="h-6 w-6 text-secondary" strokeWidth={2.5} />
        </div>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-medium leading-tight text-gray-800 sm:text-body">
              {showHireDuration ? "Hourly Duration" : delivery.name || "Delivery location"}
            </h3>
            <p className="truncate text-sm font-normal leading-relaxed text-gray-500">
              {showHireDuration
                ? "Dedicated chauffeur for your selected hours"
                : delivery.detail || "Full address not specified"}
            </p>
          </div>
          {showHireDuration ? (
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap pt-1 text-sm font-normal text-gray-500">
              <Clock className="h-3.5 w-3.5 shrink-0 text-secondary" />
              {hireDuration}
            </span>
          ) : (
            <span className="whitespace-nowrap pt-1 text-sm font-normal text-gray-500">
              {showDeliveryTime ? deliveryTime : "—"}
            </span>
          )}
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes tripRouteMoveDown {
              0% { top: 0%; opacity: 0; transform: translateX(-50%) scale(0.6); }
              10% { opacity: 1; transform: translateX(-50%) scale(1); }
              90% { opacity: 1; transform: translateX(-50%) scale(1); }
              100% { top: 100%; opacity: 0; transform: translateX(-50%) scale(0.6); }
            }
          `,
        }}
      />
    </div>
  );
}
