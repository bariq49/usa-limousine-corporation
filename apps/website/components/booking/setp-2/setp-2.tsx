"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "@usa-limousine-corporation/ui/svg";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { useBookingStore } from "@/store/use-booking-store";
import { useCategories, useCategoriesByDistance } from "@/hooks/queries/use-fleet";
import { TRIP_TYPES } from "@/constants/booking-constants";
import VehicleCategoryCard from "./VehicleCategoryCard";
import BookingStepActions from "../booking-step-actions";
import MobileSummary from "../mobile-summary";
import { VehicleCategoryCardSkeleton } from "../../skeletons/VehicleCategoryCardSkeleton";
import { useHasHydrated } from "@/hooks/use-has-hydrated";
import type { VehicleCategory } from "@/types/booking.types";

const SKELETON_COUNT = 10;

function Step2() {
  const hasHydrated = useHasHydrated();
  const router = useRouter();
  const { step1, step2, setStep2Data } = useBookingStore();
  const [isNavigating, setIsNavigating] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  const isHourly = step1?.tripType === TRIP_TYPES.HOURLY;
  const distanceQuery = useCategoriesByDistance({
    distance: step1?.distance ?? 0,
    isAirport: Boolean(step1?.isAirportSelected),
    enabled: !isHourly,
  });
  const hourlyQuery = useCategories(isHourly);
  const { data: categories = [], isLoading } = isHourly ? hourlyQuery : distanceQuery;

  const selectedId = step2?.vehicleCategory?.id;
  const showSkeletons = isLoading && categories.length === 0;

  const handleSelect = (vehicleCategory: VehicleCategory) => {
    if (selectedId === vehicleCategory.id) {
      setStep2Data(null);
      return;
    }

    setStep2Data({
      vehicleCategory,
      vehicleCount: 1,
      passengers: 1,
      bags: 0,
    });
  };

  /** Changing a counter selects the vehicle; fewer vehicles cap passengers and bags to match. */
  const handleCountsChange = (
    vehicleCategory: VehicleCategory,
    vehicleCount: number,
    passengers: number,
    bags: number,
  ) => {
    setStep2Data({
      vehicleCategory: selectedId === vehicleCategory.id ? undefined : vehicleCategory,
      vehicleCount,
      passengers: Math.min(passengers, vehicleCategory.passengerCount * vehicleCount),
      bags: Math.min(bags, vehicleCategory.luggageCount * vehicleCount),
    });
  };

  const handleContinue = () => {
    if (!step2 || isNavigating) return;

    setIsNavigating(true);
    router.push(isHourly ? "/contact-us" : "/book-ride/passenger-details");
  };

  const continueButton = (
    <Button
      type="button"
      onClick={handleContinue}
      disabled={!step2}
      isLoading={isNavigating}
      className="h-11 flex-1 gap-2 rounded-sm bg-black font-semibold text-white hover:bg-black/90"
    >
      {isHourly ? "Request Quote" : "Continue"}
      <ChevronRight width={16} height={16} strokeWidth={2.5} />
    </Button>
  );

  if (!hasHydrated) return null;

  return (
    <>
      <h1 className="mb-4 hidden text-2xl font-bold tracking-tight text-black md:block">
        Choose your vehicle
      </h1>
      <div className="flex w-full flex-col gap-1.5 md:gap-2">
        {showSkeletons &&
          Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <VehicleCategoryCardSkeleton
              key={`category-skeleton-${index}`}
              isExpanded
            />
          ))}

        {categories.map((vehicleCategory: VehicleCategory) => {
          const isSelected = selectedId === vehicleCategory.id;
          const vehicleCount = isSelected ? (step2?.vehicleCount ?? 1) : 1;
          const passengers = isSelected ? (step2?.passengers ?? 1) : 1;
          const bags = isSelected ? (step2?.bags ?? 0) : 0;

          return (
            <VehicleCategoryCard
              key={vehicleCategory.id}
              vehicleCategory={vehicleCategory}
              isSelected={isSelected}
              vehicleCount={vehicleCount}
              passengers={passengers}
              bags={bags}
              onSelect={handleSelect}
              onVehicleCountChange={(value) =>
                handleCountsChange(vehicleCategory, value, passengers, bags)
              }
              onPassengersChange={(value) =>
                handleCountsChange(vehicleCategory, vehicleCount, value, bags)
              }
              onBagsChange={(value) =>
                handleCountsChange(vehicleCategory, vehicleCount, passengers, value)
              }
              onShowSummary={() => {
                if (!isSelected) handleSelect(vehicleCategory);
                setIsSummaryOpen(true);
              }}
            />
          );
        })}
      </div>

      <BookingStepActions backHref="/">{continueButton}</BookingStepActions>

      <MobileSummary
        isOpen={isSummaryOpen}
        onOpenChange={setIsSummaryOpen}
        action={continueButton}
      />
    </>
  );
}

export default Step2;
