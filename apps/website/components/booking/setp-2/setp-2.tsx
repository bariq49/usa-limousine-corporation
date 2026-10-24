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
import { VehicleCategoryCardSkeleton } from "../../skeletons/VehicleCategoryCardSkeleton";
import { useHasHydrated } from "@/hooks/use-has-hydrated";
import type { VehicleCategory } from "@/types/booking.types";

const SKELETON_COUNT = 10;

function Step2() {
  const hasHydrated = useHasHydrated();
  const router = useRouter();
  const { step1, step2, setStep2Data } = useBookingStore();
  const [isNavigating, setIsNavigating] = useState(false);

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

  /** Fewer vehicles lower the capacity, so passengers and bags are capped to match. */
  const handleVehicleCountChange = (vehicleCount: number) => {
    const category = step2?.vehicleCategory;
    if (!category) return;

    setStep2Data({
      vehicleCount,
      passengers: Math.min(step2.passengers, category.passengerCount * vehicleCount),
      bags: Math.min(step2.bags, category.luggageCount > 0 ? vehicleCount : 0),
    });
  };

  const handleContinue = () => {
    if (!step2 || isNavigating) return;

    setIsNavigating(true);
    router.push(isHourly ? "/contact-us" : "/book-ride/passenger-details");
  };

  if (!hasHydrated) return null;

  return (
    <>
      <div className="flex w-full flex-col gap-1.5 md:gap-2">
        {showSkeletons &&
          Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <VehicleCategoryCardSkeleton
              key={`category-skeleton-${index}`}
              isExpanded={index === 0}
            />
          ))}

        {categories.map((vehicleCategory: VehicleCategory) => (
          <VehicleCategoryCard
            key={vehicleCategory.id}
            vehicleCategory={vehicleCategory}
            isSelected={selectedId === vehicleCategory.id}
            vehicleCount={selectedId === vehicleCategory.id ? (step2?.vehicleCount ?? 1) : 1}
            passengers={step2?.passengers ?? 1}
            bags={step2?.bags ?? 0}
            onSelect={handleSelect}
            onVehicleCountChange={handleVehicleCountChange}
            onPassengersChange={(passengers) => setStep2Data({ passengers })}
            onBagsChange={(bags) => setStep2Data({ bags })}
          />
        ))}
      </div>

      <BookingStepActions backHref="/">
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
      </BookingStepActions>
    </>
  );
}

export default Step2;
