"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "@usa-limousine-corporation/ui/svg";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { useBookingStore } from "@/store/use-booking-store";
import { useSyncQuote, useVehicleEstimates } from "@/hooks/queries/use-quotes";
import type { ApiError } from "@/lib/api/client";
import { PICKUP_TIME_ERRORS } from "@/constants/booking-constants";
import VehicleCategoryCard from "./VehicleCategoryCard";
import BookingStepActions from "../booking-step-actions";
import MobileSummary from "../mobile-summary";
import { VehicleCategoryCardSkeleton } from "../../skeletons/VehicleCategoryCardSkeleton";
import { useHasHydrated } from "@/hooks/use-has-hydrated";
import type { QuoteEstimate, VehicleCategory } from "@/types/booking.types";

const SKELETON_COUNT = 10;

function Step2() {
  const hasHydrated = useHasHydrated();
  const router = useRouter();
  const { step2, quote: selectedQuote, setStep2Data } = useBookingStore();
  const [isNavigating, setIsNavigating] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  const vehicleEstimates = useVehicleEstimates();
  const syncQuote = useSyncQuote();
  const quoteError = syncQuote.error as ApiError | null;
  const priceError =
    (vehicleEstimates.error as ApiError | null)?.message ??
    (quoteError?.code && PICKUP_TIME_ERRORS.includes(quoteError.code)
      ? undefined
      : quoteError?.message);
  const estimates = vehicleEstimates.data ?? [];
  const estimateByCategory = new Map(
    estimates.map((estimate) => [estimate.vehicleCategory.id, estimate]),
  );
  const categories = estimates.map((estimate) => estimate.vehicleCategory);
  const isLoading = vehicleEstimates.isLoading;

  const selectedId = step2?.vehicleCategory?.id;
  const showSkeletons = isLoading && categories.length === 0;

  const handleSelect = (vehicleCategory: VehicleCategory) => {
    if (selectedId === vehicleCategory.id) return;

    setStep2Data({
      vehicleCategory,
      vehicleCount: 1,
      passengers: 1,
      bags: 0,
    });
  };

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

  const firstCategory = categories[0];
  const selectedInList = categories.some((category) => category.id === selectedId);

  useEffect(() => {
    if (!firstCategory || selectedInList) return;
    setStep2Data({
      vehicleCategory: firstCategory,
      vehicleCount: 1,
      passengers: 1,
      bags: 0,
    });
  }, [firstCategory, selectedInList, setStep2Data]);

  const handleContinue = () => {
    if (!step2 || isNavigating) return;
    setIsNavigating(true);
    router.push("/book-ride/passenger-details");
  };

  const continueButton = (
    <Button
      type="button"
      onClick={handleContinue}
      disabled={!step2}
      isLoading={isNavigating}
      className="h-11 flex-1 gap-2 rounded-sm bg-black font-semibold text-white hover:bg-black/90"
    >
      Continue
      <ChevronRight width={16} height={16} strokeWidth={2.5} />
    </Button>
  );

  if (!hasHydrated) return null;

  return (
    <>
      <h1 className="mb-5 hidden text-3xl font-bold tracking-tight text-black md:block">
        Choose your vehicle
      </h1>
      {priceError ? (
        <div className="mb-3 rounded-sm border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {priceError}
        </div>
      ) : null}
      <div className="flex w-full flex-col gap-1.5 md:gap-2">
        {showSkeletons &&
          Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <VehicleCategoryCardSkeleton
              key={`category-skeleton-${index}`}
              isExpanded
            />
          ))}

        {!showSkeletons && !priceError && categories.length === 0 ? (
          <div className="rounded-sm border border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
            No vehicles are available for this trip. Try a different duration, route, or time.
          </div>
        ) : null}

        {categories.map((vehicleCategory: VehicleCategory) => {
          const isSelected = selectedId === vehicleCategory.id;
          const vehicleCount = isSelected ? (step2?.vehicleCount ?? 1) : 1;
          const passengers = isSelected ? (step2?.passengers ?? 1) : 1;
          const bags = isSelected ? (step2?.bags ?? 0) : 0;
          const estimate = estimateByCategory.get(vehicleCategory.id) ?? null;
          const hasSelectedQuote =
            isSelected && selectedQuote?.vehicleCategory.id === vehicleCategory.id;
          const cardQuote: QuoteEstimate | null = hasSelectedQuote ? selectedQuote : estimate;

          return (
            <VehicleCategoryCard
              key={vehicleCategory.id}
              vehicleCategory={vehicleCategory}
              quote={cardQuote}
              isPricing={isSelected && !hasSelectedQuote && vehicleCount > 1}
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
