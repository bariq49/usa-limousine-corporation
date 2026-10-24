"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "@usa-limousine-corporation/ui/svg";
import Setp2 from "@/components/booking/setp-2/setp-2";
import { AnimatedRouteMap } from "@usa-limousine-corporation/ui/bookings/animated-route-map";
import BookingMobileTripBar from "@/components/booking/booking-mobile-trip-bar";
import SummaryDetails from "@/components/booking/summary-details";
import { useBookingStore } from "@/store/use-booking-store";
import { cn } from "@/lib/utils";

function SelectVehiclePage() {
  const router = useRouter();
  const step1 = useBookingStore((s) => s.step1);
  const hasMap = Boolean(step1?.pickupAddress?.trim()) && Boolean(step1?.deliveryAddress?.trim());

  return (
    <div className="min-h-screen w-full md:pb-10 max-md:pb-8">
      <h1 className="sr-only">Airport Transfer Service - Book Your Ride</h1>
      <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-4 md:px-4 md:pt-4 lg:flex-row lg:items-start lg:gap-3">
        <div className="relative z-10 flex min-w-0 flex-1 flex-col md:overflow-hidden md:rounded-sm md:bg-white md:px-4 md:pb-4">
          {hasMap ? (
            <div className="z-0 max-md:sticky max-md:top-safe-header">
              <AnimatedRouteMap
                pickupAddress={step1?.pickupAddress ?? ""}
                deliveryAddress={step1?.deliveryAddress ?? ""}
                stops={step1?.stops}
              />
            </div>
          ) : null}

          <div
            className={cn(
              "relative z-10 flex flex-col bg-white max-md:pb-6 md:mt-0 md:rounded-none md:pb-0 md:shadow-none",
              hasMap
                ? "max-md:-mt-10 max-md:rounded-t-2xl max-md:pt-3 max-md:shadow-sheet"
                : "max-md:pt-3",
            )}
          >
            {hasMap ? (
              <div className="mb-1 flex w-full justify-center lg:hidden">
                <div className="h-1.5 w-12 rounded-full bg-gray" />
              </div>
            ) : null}

            <BookingMobileTripBar
              pricingLabel="All prices include taxes and fees"
              leftAction={
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-black transition-colors hover:text-gray-700"
                >
                  <ArrowLeft width={16} height={16} strokeWidth={2.5} />
                  <span className="hidden sm:inline">Back to Home</span>
                  <span className="sm:hidden">Back</span>
                </button>
              }
            />

            <div className="px-1 md:px-0">
              <Setp2 />
            </div>
          </div>
        </div>

        <aside className="hidden w-115 shrink-0 flex-col gap-4 lg:flex lg:sticky lg:top-24 lg:self-start">
          <SummaryDetails />
        </aside>
      </div>
    </div>
  );
}

export default SelectVehiclePage;
