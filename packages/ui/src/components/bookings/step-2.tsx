"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ChevronRight } from "../../svg";
import { Button } from "../button";
import { useBookingStore } from "../../store/booking";
import { useHasHydrated, useEstimates } from "../../hooks/use-booking";
import { PICKUP_TIME_ERRORS } from "../../constants/booking";
import VehicleCategoryCard from "./vehicle-category-card";
import BookingStepActions from "./booking-step-actions";
import MobileSummary from "./mobile-summary";
import { VehicleCategoryCardSkeleton } from "../../skeletons/vehicle-category-card-skeleton";
import type { ApiError } from "../../types/api";
import type {
  Step2,
  VehicleCategory,
  CountsChange,
  Estimate,
} from "../../types/booking";

const SKELETON_COUNT = 10;

function Step2() {
  const hasHydrated = useHasHydrated();
  const router = useRouter();
  const { step2, setStep2, setStep3 } = useBookingStore();
  const [isNavigating, setIsNavigating] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const vehicleEstimates = useEstimates();
  const estimateError = vehicleEstimates.error as ApiError | null;
  const priceError = estimateError?.message;
  const estimates = vehicleEstimates.data ?? [];

  useEffect(() => {
    if (estimateError?.code && PICKUP_TIME_ERRORS.includes(estimateError.code)) {
      toast.error(estimateError.message, { id: "pickup-time" });
      router.push("/");
    }
  }, [estimateError, router]);

  const estimateByCategory = new Map(
    estimates.map((estimate) => [estimate.vehicleCategory.id, estimate]),
  );
  const categories = estimates.map((estimate) => estimate.vehicleCategory);
  const isLoading = vehicleEstimates.isLoading;

  const selectedId = step2?.vehicleCategory?.id;
  const showSkeletons = isLoading && categories.length === 0;

  const selectVehicle = (vehicleCategory: VehicleCategory) => {
    const next: Step2 = {
      vehicleCategory,
      vehicleCount: 1,
      passengers: 1,
      bags: 0,
      pricing: null,
      total: 0,
      distance: 0,
      travelDuration: 0,
    };
    setStep2(next);
    setStep3(null);
  };

  const handleSelect = (vehicleCategory: VehicleCategory) => {
    if (selectedId === vehicleCategory.id) return;
    selectVehicle(vehicleCategory);
  };

  const handleCountsChange = (data: CountsChange) => {
    const { vehicleCategory, vehicleCount, passengers, bags } = data;
    setStep2({
      vehicleCategory,
      vehicleCount,
      passengers: Math.min(passengers, vehicleCategory.passengerCount * vehicleCount),
      bags: Math.min(bags, vehicleCategory.luggageCount * vehicleCount),
      pricing: null,
      total: 0,
      distance: 0,
      travelDuration: 0,
    });
    if (selectedId !== vehicleCategory.id) setStep3(null);
  };

  const firstCategory = categories[0];
  const selectedInList = categories.some((category) => category.id === selectedId);

  useEffect(() => {
    if (!firstCategory || selectedInList) return;
    setStep2({
      vehicleCategory: firstCategory,
      vehicleCount: 1,
      passengers: 1,
      bags: 0,
      pricing: null,
      total: 0,
      distance: 0,
      travelDuration: 0,
    });
    setStep3(null);
  }, [firstCategory, selectedInList, setStep2, setStep3]);

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
          const hasStep2Price =
            isSelected && Boolean(step2?.pricing) && step2?.vehicleCategory.id === vehicleCategory.id;
          const cardEstimate: Estimate | null = hasStep2Price
            ? {
                vehicleCategory: step2!.vehicleCategory,
                vehicleCount: step2!.vehicleCount,
                pricing: step2!.pricing!,
                total: step2!.total,
                distance: step2!.distance,
                travelDuration: step2!.travelDuration,
              }
            : estimate;

          return (
            <VehicleCategoryCard
              key={vehicleCategory.id}
              vehicleCategory={vehicleCategory}
              estimate={cardEstimate}
              isPricing={isSelected && !hasStep2Price && vehicleCount > 1}
              isSelected={isSelected}
              vehicleCount={vehicleCount}
              passengers={passengers}
              bags={bags}
              onSelect={handleSelect}
              onVehicleCountChange={(value) =>
                handleCountsChange({
                  vehicleCategory,
                  vehicleCount: value,
                  passengers,
                  bags,
                })
              }
              onPassengersChange={(value) =>
                handleCountsChange({
                  vehicleCategory,
                  vehicleCount,
                  passengers: value,
                  bags,
                })
              }
              onBagsChange={(value) =>
                handleCountsChange({
                  vehicleCategory,
                  vehicleCount,
                  passengers,
                  bags: value,
                })
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
