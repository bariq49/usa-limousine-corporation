"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useBookingStore } from "@/store/use-booking-store";
import { useCategoriesByDistance, useCategoriesForHourly } from "@/hooks/queries/use-fleet";
import { TRIP_TYPES } from "@/constants/booking-constants";
import VehicleCategoryCard from "./VehicleCategoryCard";
import { VehicleCategoryCardSkeleton } from "../../skeletons/VehicleCategoryCardSkeleton";
import { useHasHydrated } from "@/hooks/use-has-hydrated";
import type { Step2ContinueProp, VehicleCategory } from "@/types/booking.types";

const SKELETON_COUNT = 10;

function Step2() {
  const hasHydrated = useHasHydrated();
  const router = useRouter();
  const { step1, step2, setStep2Data } = useBookingStore();
  const [loadingCategoryId, setLoadingCategoryId] = useState<string | null>(null);

  const isHourly = step1?.tripType === TRIP_TYPES.HOURLY;
  const distanceQuery = useCategoriesByDistance({
    distance: step1?.distance ?? 0,
    isAirport: Boolean(step1?.isAirportSelected),
    enabled: !isHourly,
  });
  const hourlyQuery = useCategoriesForHourly(isHourly);
  const { data: categories = [], isLoading } = isHourly ? hourlyQuery : distanceQuery;

  const selectedId = step2?.vehicleCategory?._id;
  const showSkeletons = isLoading && categories.length === 0;

  const handleSelect = (vehicleCategory: VehicleCategory) => {
    if (selectedId === vehicleCategory._id) {
      setStep2Data(null);
      return;
    }

    setStep2Data({
      vehicleCategory,
      passengers: 1,
      bags: 0,
    });
  };

  const handleContinue = (prop: Step2ContinueProp) => {
    const { vehicleCategory, passengers, luggage } = prop;
    if (loadingCategoryId) return;

    setLoadingCategoryId(vehicleCategory._id);
    setStep2Data({
      vehicleCategory,
      passengers,
      bags: luggage,
    });
    router.push("/book-ride/passenger-details");
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
            key={vehicleCategory._id}
            vehicleCategory={vehicleCategory}
            isSelected={selectedId === vehicleCategory._id}
            isLoading={loadingCategoryId === vehicleCategory._id}
            onSelect={handleSelect}
            onContinue={handleContinue}
          />
        ))}
      </div>
    </>
  );
}

export default Step2;
