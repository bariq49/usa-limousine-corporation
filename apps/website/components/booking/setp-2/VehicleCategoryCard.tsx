"use client";

import Image from "next/image";
import {
  Car,
  Check,
  ChevronDown,
  ChevronRight,
  Luggage,
  Users,
  Wifi,
} from "@usa-limousine-corporation/ui/svg";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { cn, formatPrice } from "@/lib/utils";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Stepper } from "@usa-limousine-corporation/ui/components/stepper";
import { resolveVehicleCategoryPrice } from "@/store/use-booking-store";
import type { Step2ContinueProp, VehicleCategory } from "@/types/booking.types";

interface VehicleCategoryCardProps {
  vehicleCategory: VehicleCategory;
  isSelected?: boolean;
  isLoading: boolean;
  onSelect: (vehicleCategory: VehicleCategory) => void;
  onContinue: (prop: Step2ContinueProp) => void;
}

export default function VehicleCategoryCard({
  vehicleCategory,
  isSelected = false,
  isLoading,
  onSelect,
  onContinue,
}: VehicleCategoryCardProps) {
  const router = useRouter();
  const [passengerCount, setPassengerCount] = useState(1);
  const [luggageCount, setLuggageCount] = useState(0);
  const [isFareSummaryOpen, setIsFareSummaryOpen] = useState(true);

  const breakdown = vehicleCategory.priceBreakdown;
  const totalPrice = resolveVehicleCategoryPrice(vehicleCategory);
  const priceBeforeDiscount = breakdown?.oneWayPriceBeforeDiscount ?? totalPrice;
  const discountPercentage = breakdown?.oneWayDiscountPercentage ?? 0;
  const discountAmount = breakdown?.oneWayDiscountAmount ?? 0;
  const basePrice = breakdown?.oneWayBasePrice ?? 0;
  const surchargeAmount = breakdown?.oneWaySurchargeAmount ?? 0;
  const surchargePercentage = breakdown?.oneWaySurchargePercentage ?? 0;
  const gratuityAmount = breakdown?.oneWayGratuityAmount ?? 0;
  const gratuityPercentage = breakdown?.oneWayGratuityPercentage ?? 0;
  const taxAmount = breakdown?.oneWayTaxAmount ?? 0;
  const taxPercentage = breakdown?.oneWayTaxPercentage ?? 0;
  const transactionFeeAmount = breakdown?.oneWayTransactionFeeAmount ?? 0;
  const transactionFeePercentage = breakdown?.oneWayTransactionFeePercentage ?? 0;
  const airportFeeAmount = breakdown?.oneWayAirportFeeAmount ?? 0;
  const hasDiscount = discountPercentage > 0 && discountAmount > 0;
  const showFareSummary = !vehicleCategory.allowRequestQuote && totalPrice > 0;

  return (
    <div
      onClick={() => onSelect(vehicleCategory)}
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-sm border bg-gray-50 transition-all duration-300",
        isSelected ? "border-border shadow-sm" : "border-border"
      )}
    >
      {hasDiscount && (
        <div className="absolute left-0 top-0 z-10 rounded-br-sm bg-green-600 px-2 py-1 text-3xs font-bold uppercase tracking-wide text-white sm:text-xs">
          {discountPercentage}% OFF
        </div>
      )}

      <div className="flex items-center p-2 py-1 md:p-4">
        <div className="relative aspect-4/3 w-36 flex-shrink-0 overflow-hidden rounded-sm bg-gray/10 px-1 sm:aspect-auto sm:w-40 sm:px-2 lg:w-48 flex items-center justify-center">
          {vehicleCategory.image ? (
            <Image
              src={vehicleCategory.image}
              alt={vehicleCategory.name}
              className="h-auto w-full transform object-contain transition-transform duration-500 group-hover:scale-105"
              width={200}
              height={140}
            />
          ) : (
            <Car className="h-12 w-12 text-gray-300 sm:h-14 sm:w-14" aria-hidden />
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-between">
          <div className="flex items-stretch justify-between gap-2">
            <div className="flex min-w-0 flex-1 flex-col justify-between">
              <div className="space-y-0.5">
                <h3 className="text-base font-semibold leading-tight md:text-lg">
                  {vehicleCategory.name}
                </h3>
                <p className="line-clamp-1 text-xs text-gray-500 sm:text-sm">
                  {vehicleCategory.carType || `${vehicleCategory.name} or similar`}
                </p>
              </div>

              <div className="flex flex-wrap gap-1 pt-2 sm:gap-2">
                <div className="flex shrink-0 items-center gap-x-1 rounded-full bg-secondary px-2.5 py-0.5 text-white sm:px-4 sm:py-1">
                  <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-3xs font-bold sm:text-sm">
                    {vehicleCategory.passengers}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-x-1 rounded-full bg-secondary px-2.5 py-0.5 text-white sm:px-4 sm:py-1">
                  <Luggage className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-3xs font-bold sm:text-sm">
                    {vehicleCategory.suitcases}
                  </span>
                </div>
                <div className="flex shrink-0 items-center rounded-full bg-secondary px-1.5 py-0.5 text-white sm:px-3 sm:py-1">
                  <Wifi className="h-3 w-3 sm:h-4 sm:w-4" />
                </div>
              </div>
            </div>

            <div className="flex flex-shrink-0 flex-col items-end justify-between">
              <div
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full shadow-sm transition-colors sm:h-6 sm:w-6",
                  isSelected ? "bg-secondary" : "border-2 border-border"
                )}
              >
                {isSelected && (
                  <Check className="h-3 w-3 text-white sm:h-4 sm:w-4" strokeWidth={4} />
                )}
              </div>

              <div className="text-right">
                {vehicleCategory.allowRequestQuote ? (
                  <span className="text-sm font-semibold text-secondary">Request Quote</span>
                ) : (
                  <div className="flex flex-col items-end gap-0.5">
                    {hasDiscount && (
                      <span className="text-xs font-medium text-gray-400 line-through decoration-2 decoration-red-500 sm:text-sm">
                        {formatPrice(priceBeforeDiscount)}
                      </span>
                    )}
                    <span className="text-lg font-bold leading-none tracking-tight text-black sm:text-2xl">
                      {formatPrice(totalPrice)}
                    </span>
                    {gratuityAmount > 0 && (
                      <span className="mt-0.5 flex items-center gap-1 text-3xs font-medium text-emerald-600 sm:text-xs">
                        <Check className="h-3 w-3" strokeWidth={3} />
                        Gratuity included
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isSelected && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <div className="mx-4 border-t border-dashed border-border" />
          <div className="flex flex-col items-center justify-center gap-4 px-4 py-2 sm:flex-row sm:justify-between">
            <div className="flex w-full items-center justify-between gap-x-1 gap-y-3 sm:w-auto sm:justify-start sm:gap-x-8">
              <Stepper
                label="Passengers"
                icon={<Users width={14} height={14} className="text-secondary sm:size-4" />}
                value={passengerCount}
                min={1}
                max={vehicleCategory.passengers}
                onChange={setPassengerCount}
                className="origin-left scale-90 sm:scale-100"
              />
              <Stepper
                label="Bags"
                icon={<Luggage width={14} height={14} className="text-secondary sm:size-4" />}
                value={luggageCount}
                min={0}
                max={vehicleCategory.suitcases}
                onChange={setLuggageCount}
                className="origin-left scale-90 sm:scale-100"
              />
            </div>

            <Button
              isLoading={isLoading && !vehicleCategory.allowRequestQuote}
              className="hidden h-9 w-fit rounded-sm bg-secondary px-4 text-sm text-white hover:bg-secondary-600 sm:inline-flex"
              onClick={(e) => {
                e.stopPropagation();
                if (vehicleCategory.allowRequestQuote) {
                  router.push("/contact-us");
                  return;
                }
                onContinue({
                  vehicleCategory,
                  passengers: passengerCount,
                  luggage: luggageCount,
                });

              }}
            >
              {vehicleCategory.allowRequestQuote ? "Request Quote" : "Continue"}
              {!vehicleCategory.allowRequestQuote && (
                <ChevronRight
                  width={14} height={14}
                  strokeWidth={4}
                  className="transition-transform group-hover/btn:translate-x-1"
                />
              )}
            </Button>
          </div>

          {showFareSummary && (
            <>
              <div className="mx-4 border-t border-dashed border-border" />
              <div className="px-4 pt-3 pb-3">
                <button
                  type="button"
                  onClick={() => setIsFareSummaryOpen((open) => !open)}
                  className="flex w-full cursor-pointer items-center justify-between text-left"
                >
                  <span className="text-caption font-semibold text-black sm:text-sm">
                    Fare Summary
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-gray-500 transition-transform duration-200",
                      isFareSummaryOpen && "rotate-180"
                    )}
                  />
                </button>

                {isFareSummaryOpen && (
                  <div className="mt-3 space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200 sm:space-y-2">
                    <div className="flex items-center justify-between text-caption text-gray-700 sm:text-sm">
                      <span>Base Price</span>
                      <span className="font-medium text-black">
                        {formatPrice(basePrice)}
                      </span>
                    </div>

                    {hasDiscount && (
                      <div className="flex items-center justify-between text-caption text-destructive sm:text-sm">
                        <span>Discount ({discountPercentage}%)</span>
                        <span className="font-medium">
                          - {formatPrice(discountAmount)}
                        </span>
                      </div>
                    )}

                    {surchargeAmount > 0 && (
                      <div className="flex items-center justify-between text-caption text-gray-700 sm:text-sm">
                        <span>Fuel Surcharge ({surchargePercentage}%)</span>
                        <span className="font-medium text-black">
                          {formatPrice(surchargeAmount)}
                        </span>
                      </div>
                    )}

                    {gratuityAmount > 0 && (
                      <div className="flex items-center justify-between text-caption text-gray-700 sm:text-sm">
                        <span>Gratuity ({gratuityPercentage}%)</span>
                        <span className="font-medium text-black">
                          {formatPrice(gratuityAmount)}
                        </span>
                      </div>
                    )}

                    {taxAmount > 0 && (
                      <div className="flex items-center justify-between text-caption text-gray-700 sm:text-sm">
                        <span>Tax ({taxPercentage}%)</span>
                        <span className="font-medium text-black">
                          {formatPrice(taxAmount)}
                        </span>
                      </div>
                    )}

                    {transactionFeeAmount > 0 && (
                      <div className="flex items-center justify-between text-caption text-gray-700 sm:text-sm">
                        <span>Transaction Fee ({transactionFeePercentage}%)</span>
                        <span className="font-medium text-black">
                          {formatPrice(transactionFeeAmount)}
                        </span>
                      </div>
                    )}

                    {airportFeeAmount > 0 && (
                      <div className="flex items-center justify-between text-caption text-gray-700 sm:text-sm">
                        <span>Airport Pickup</span>
                        <span className="font-medium text-black">
                          {formatPrice(airportFeeAmount)}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between border-t border-border pt-2 text-caption font-bold text-black sm:text-sm">
                      <span>Total Amount</span>
                      <span>{formatPrice(totalPrice)}</span>
                    </div>
                  </div>
                )}
              </div>

              <Button
                isLoading={isLoading}
                size="sm"
                className="h-9 w-full rounded-none rounded-b-sm bg-secondary px-4 text-xs text-white hover:bg-secondary-600 sm:hidden sm:text-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onContinue({
                  vehicleCategory,
                  passengers: passengerCount,
                  luggage: luggageCount,
                });

                }}
              >
                Continue
                <ChevronRight
                  width={14} height={14}
                  strokeWidth={4}
                  className="transition-transform group-hover/btn:translate-x-1"
                />
              </Button>
            </>
          )}

          {!showFareSummary && (
            <Button
              isLoading={isLoading && !vehicleCategory.allowRequestQuote}
              size="sm"
              className="h-9 w-full rounded-none rounded-b-sm bg-secondary px-4 text-xs text-white hover:bg-secondary-600 sm:hidden sm:text-sm"
              onClick={(e) => {
                e.stopPropagation();
                if (vehicleCategory.allowRequestQuote) {
                  router.push("/contact-us");
                  return;
                }
                onContinue({
                  vehicleCategory,
                  passengers: passengerCount,
                  luggage: luggageCount,
                });

              }}
            >
              {vehicleCategory.allowRequestQuote ? "Request Quote" : "Continue"}
              {!vehicleCategory.allowRequestQuote && (
                <ChevronRight
                  width={14} height={14}
                  strokeWidth={4}
                  className="transition-transform group-hover/btn:translate-x-1"
                />
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
