"use client";

import type { ReactNode } from "react";
import { AnimatedRouteMap } from "@usa-limousine-corporation/ui/bookings/animated-route-map";
import SummaryDetails from "@/components/booking/summary-details";
import { IMAGES } from "@/constants/image-constants";
import { useBookingStore } from "@/store/use-booking-store";
import { cn } from "@/lib/utils";

/** How far the step content sheet overlaps the map on small screens (matches -mt-10). */
const MOBILE_SHEET_OVERLAP = 40;

type Props = {
  children: ReactNode;
  /** Show the route map on small screens too; the passenger form shows it on desktop only. */
  showMobileMap?: boolean;
};

export default function BookingStepLayout({ children, showMobileMap = true }: Props) {
  const step1 = useBookingStore((s) => s.step1);
  const pickupTime = useBookingStore((s) => s.step3?.pickupTime);
  const hasMap = Boolean(step1?.pickupAddress?.trim()) && Boolean(step1?.deliveryAddress?.trim());
  const hasMobileMap = hasMap && showMobileMap;

  return (
    <div className="flex min-h-screen w-full items-start justify-center max-xl:pb-2 xl:px-5 xl:pt-6 xl:pb-10">
      <div className="flex w-full flex-col items-start gap-4 xl:flex-row xl:gap-2">
        <div className="flex w-full min-w-0 flex-1 flex-col items-start xl:flex-row xl:gap-2">
          {hasMap ? (
            <div
              className={cn(
                "z-0 order-1 w-full shrink-0 max-xl:sticky max-xl:top-safe-header xl:sticky xl:top-24 xl:w-135 xl:min-w-130 xl:max-w-140 xl:self-start 2xl:w-170 2xl:min-w-160 2xl:max-w-180 3xl:w-215 3xl:min-w-200 3xl:max-w-215",
                !showMobileMap && "max-xl:hidden",
              )}
            >
              <AnimatedRouteMap
                pickupAddress={step1?.pickupAddress ?? ""}
                deliveryAddress={step1?.deliveryAddress ?? ""}
                stops={step1?.stops}
                pickupTime={pickupTime}
                travelDuration={step1?.travelDuration}
                carMarkerSrc={IMAGES.MAP_CAR_MARKER}
                bottomInset={MOBILE_SHEET_OVERLAP}
                wrapperClassName="h-full"
                className="max-xl:rounded-none max-xl:border-0 max-xl:shadow-none xl:h-map-panel xl:min-h-130 xl:rounded-sm xl:border xl:border-border xl:shadow-sm"
              />
            </div>
          ) : null}

          <div
            className={cn(
              "relative z-10 order-2 flex w-full min-w-0 flex-1 flex-col bg-white md:rounded-sm md:px-1 md:py-2.5",
              hasMobileMap
                ? "max-xl:-mt-10 max-xl:rounded-t-md max-xl:pt-2 max-xl:shadow-sheet"
                : "max-md:pt-3",
            )}
          >
            {hasMobileMap ? (
              <div className="mb-3 flex w-full justify-center xl:hidden">
                <div className="h-1.5 w-12 rounded-full bg-gray" />
              </div>
            ) : null}

            <div className="px-1 md:px-0">{children}</div>
          </div>
        </div>

        <aside className="hidden xl:sticky xl:top-24 xl:order-3 xl:flex xl:w-85 xl:min-w-80 xl:shrink-0 xl:flex-col xl:gap-4 xl:self-start 2xl:w-95 2xl:min-w-90 3xl:w-102.5 3xl:min-w-97.5">
          <SummaryDetails />
        </aside>
      </div>
    </div>
  );
}
