"use client";

import Image from "next/image";
import {
  Car,
  Check,
  ChevronDown,
  Luggage,
  Users,
} from "@usa-limousine-corporation/ui/svg";
import { cn, formatPrice } from "@/lib/utils";
import { useState } from "react";
import { Stepper } from "@usa-limousine-corporation/ui/components/stepper";
import { resolveVehicleCategoryPrice } from "@/store/use-booking-store";
import { MAX_VEHICLES } from "@/constants/booking-constants";
import { Marquee } from "@/components/animations";
import type { VehicleCategory } from "@/types/booking.types";

interface VehicleCategoryCardProps {
  vehicleCategory: VehicleCategory;
  isSelected?: boolean;
  vehicleCount: number;
  passengers: number;
  bags: number;
  onSelect: (vehicleCategory: VehicleCategory) => void;
  onVehicleCountChange: (value: number) => void;
  onPassengersChange: (value: number) => void;
  onBagsChange: (value: number) => void;
}

export default function VehicleCategoryCard({
  vehicleCategory,
  isSelected = false,
  vehicleCount,
  passengers,
  bags,
  onSelect,
  onVehicleCountChange,
  onPassengersChange,
  onBagsChange,
}: VehicleCategoryCardProps) {
  const [isFareSummaryOpen, setIsFareSummaryOpen] = useState(true);

  const breakdown = vehicleCategory.priceBreakdown;
  const isQuote = !breakdown;
  const totalPrice = resolveVehicleCategoryPrice(vehicleCategory) * vehicleCount;
  const priceBeforeDiscount = (breakdown?.oneWayPriceBeforeDiscount ?? 0) * vehicleCount || totalPrice;
  const discountPercentage = breakdown?.oneWayDiscountPercentage ?? 0;
  const discountAmount = (breakdown?.oneWayDiscountAmount ?? 0) * vehicleCount;
  const basePrice = (breakdown?.oneWayBasePrice ?? 0) * vehicleCount;
  const surchargeAmount = (breakdown?.oneWaySurchargeAmount ?? 0) * vehicleCount;
  const surchargePercentage = breakdown?.oneWaySurchargePercentage ?? 0;
  const gratuityAmount = (breakdown?.oneWayGratuityAmount ?? 0) * vehicleCount;
  const gratuityPercentage = breakdown?.oneWayGratuityPercentage ?? 0;
  const taxAmount = (breakdown?.oneWayTaxAmount ?? 0) * vehicleCount;
  const taxPercentage = breakdown?.oneWayTaxPercentage ?? 0;
  const transactionFeeAmount = (breakdown?.oneWayTransactionFeeAmount ?? 0) * vehicleCount;
  const transactionFeePercentage = breakdown?.oneWayTransactionFeePercentage ?? 0;
  const airportFeeAmount = (breakdown?.oneWayAirportFeeAmount ?? 0) * vehicleCount;
  const hasDiscount = discountPercentage > 0 && discountAmount > 0;
  const showFareSummary = !isQuote && totalPrice > 0;

  return (
    <div
      onClick={() => onSelect(vehicleCategory)}
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-sm border bg-gray-50 transition-all duration-300",
        isSelected ? "border-secondary shadow-sm ring-1 ring-secondary" : "border-border",
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
                <Marquee
                  text={vehicleCategory.description || `${vehicleCategory.name} or similar`}
                  className="text-xs text-gray-500 sm:hidden"
                />
                <p className="hidden line-clamp-1 text-sm text-gray-500 sm:block">
                  {vehicleCategory.description || `${vehicleCategory.name} or similar`}
                </p>
              </div>

              <div className="flex flex-wrap gap-1 pt-2 sm:gap-2">
                <div className="flex shrink-0 items-center gap-x-1 rounded-full bg-secondary px-2.5 py-0.5 text-white sm:px-4 sm:py-1">
                  <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-3xs font-bold sm:text-sm">
                    {vehicleCategory.passengerCount}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-x-1 rounded-full bg-secondary px-2.5 py-0.5 text-white sm:px-4 sm:py-1">
                  <Luggage className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-3xs font-bold sm:text-sm">{vehicleCategory.luggageCount}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-shrink-0 flex-col items-end justify-center">
              <div className="text-right">
                {isQuote ? (
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
                    {!isQuote && (
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
            <div className="grid w-full grid-cols-3 gap-2 sm:flex sm:w-auto sm:items-center sm:justify-start sm:gap-x-8">
              <Stepper
                label="Cars"
                icon={<Car width={14} height={14} className="text-secondary sm:size-4" />}
                value={vehicleCount}
                min={1}
                max={MAX_VEHICLES}
                onChange={onVehicleCountChange}
                className="flex-col gap-1.5 sm:flex-row sm:gap-1"
              />
              <Stepper
                label="Passengers"
                icon={<Users width={14} height={14} className="text-secondary sm:size-4" />}
                value={passengers}
                min={1}
                max={vehicleCategory.passengerCount * vehicleCount}
                onChange={onPassengersChange}
                className="flex-col gap-1.5 sm:flex-row sm:gap-1"
              />
              <Stepper
                label="Bags"
                icon={<Luggage width={14} height={14} className="text-secondary sm:size-4" />}
                value={bags}
                min={0}
                max={vehicleCategory.luggageCount > 0 ? vehicleCount : 0}
                onChange={onBagsChange}
                className="flex-col gap-1.5 sm:flex-row sm:gap-1"
              />
            </div>
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
                      isFareSummaryOpen && "rotate-180",
                    )}
                  />
                </button>

                {isFareSummaryOpen && (
                  <div className="mt-3 space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200 sm:space-y-2">
                    <div className="flex items-center justify-between text-caption text-gray-700 sm:text-sm">
                      <span>Base Price</span>
                      <span className="font-medium text-black">{formatPrice(basePrice)}</span>
                    </div>

                    {hasDiscount && (
                      <div className="flex items-center justify-between text-caption text-destructive sm:text-sm">
                        <span>Discount ({discountPercentage}%)</span>
                        <span className="font-medium">- {formatPrice(discountAmount)}</span>
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
                        <span className="font-medium text-black">{formatPrice(taxAmount)}</span>
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
            </>
          )}
        </div>
      )}
    </div>
  );
}
