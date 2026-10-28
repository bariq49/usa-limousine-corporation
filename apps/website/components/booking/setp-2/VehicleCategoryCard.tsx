"use client";

import Image from "next/image";
import {
  Car,
  CircleHelp,
  Luggage,
  Users,
} from "@usa-limousine-corporation/ui/svg";
import { cn, formatPrice } from "@/lib/utils";
import { Stepper } from "@usa-limousine-corporation/ui/components/stepper";
import { resolveVehicleCategoryPrice, useBookingStore } from "@/store/use-booking-store";
import { MAX_VEHICLES } from "@/constants/booking-constants";
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
  onShowSummary: () => void;
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
  onShowSummary,
}: VehicleCategoryCardProps) {
  const breakdown = vehicleCategory.priceBreakdown;
  const isQuote = !breakdown;
  const returnEnabled = useBookingStore((state) => Boolean(state.step3?.returnEnabled));
  const returnPrice = returnEnabled ? (breakdown?.returnTotalPrice ?? 0) : 0;
  const totalPrice = (resolveVehicleCategoryPrice(vehicleCategory) + returnPrice) * vehicleCount;
  const priceBeforeDiscount =
    ((breakdown?.oneWayPriceBeforeDiscount ?? 0) +
      (returnEnabled ? (breakdown?.returnPriceBeforeDiscount ?? 0) : 0)) *
      vehicleCount || totalPrice;
  const discountAmount =
    ((breakdown?.oneWayDiscountAmount ?? 0) +
      (returnEnabled ? (breakdown?.returnDiscountAmount ?? 0) : 0)) *
    vehicleCount;
  const oneWayDiscountPercentage = breakdown?.oneWayDiscountPercentage ?? 0;
  const discountPercentage =
    returnEnabled && (breakdown?.returnDiscountPercentage ?? 0) !== oneWayDiscountPercentage
      ? Math.round((discountAmount / priceBeforeDiscount) * 100)
      : oneWayDiscountPercentage;
  const hasDiscount = discountPercentage > 0 && discountAmount > 0;

  return (
    <div
      onClick={() => onSelect(vehicleCategory)}
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-sm border bg-white transition-all duration-300",
        isSelected ? "border-gray-400 shadow-sm" : "border-border",
      )}
    >
      <div className="flex items-center px-3 pt-2 pb-1 md:px-4">
        <div className="relative flex h-20 w-32 flex-shrink-0 items-center justify-center overflow-hidden rounded-sm px-1 sm:h-24 sm:w-40 sm:px-2 lg:w-44">
          {vehicleCategory.image ? (
            <Image
              src={vehicleCategory.image}
              alt={vehicleCategory.name}
              className="h-full w-full object-contain"
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
                <div className="flex items-center gap-1.5">
                  <h3 className="text-base font-semibold leading-tight md:text-xl">
                    {vehicleCategory.name}
                  </h3>
                  <button
                    type="button"
                    aria-label={`${vehicleCategory.name} booking summary`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onShowSummary();
                    }}
                    className="cursor-pointer text-gray-500 hover:text-black xl:hidden"
                  >
                    <CircleHelp className="h-4 w-4" />
                  </button>
                </div>
                <p className="hidden text-sm text-gray-500 sm:line-clamp-1">
                  {vehicleCategory.description || `${vehicleCategory.name} or similar`}
                </p>
              </div>

              <div className="flex flex-wrap gap-3 pt-2 sm:gap-4">
                <div className="flex shrink-0 items-center gap-x-1 text-gray-600">
                  <Users className="h-4.5 w-4.5" />
                  <span className="text-sm font-medium">
                    {vehicleCategory.passengerCount}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-x-1 text-gray-600">
                  <Luggage className="h-4.5 w-4.5" />
                  <span className="text-sm font-medium">{vehicleCategory.luggageCount}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-shrink-0 flex-col items-end justify-center">
              <div className="text-right">
                {isQuote ? (
                  <span className="text-sm font-semibold text-secondary">Request Quote</span>
                ) : (
                  <div className="flex flex-col items-end gap-1">
                    {hasDiscount && (
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <span className="text-gray-400 line-through">
                          {formatPrice(priceBeforeDiscount)}
                        </span>
                        <span className="font-semibold text-success">-{discountPercentage}%</span>
                      </div>
                    )}
                    <span className="text-2xl font-semibold leading-none tracking-tight text-black sm:text-3xl">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div onClick={(e) => e.stopPropagation()}>
        <div className="mx-3 border-t border-dashed border-border md:mx-4" />
        <div className="flex items-center px-3 py-2 md:px-4">
          <div className="grid w-full grid-cols-3 gap-2 sm:flex sm:w-auto sm:items-center sm:justify-start sm:gap-x-8">
            <Stepper
              label="Cars"
              icon={<Car width={14} height={14} className="sm:size-4" />}
              value={vehicleCount}
              min={1}
              max={MAX_VEHICLES}
              onChange={onVehicleCountChange}
              className="flex-col gap-1 sm:flex-row sm:gap-2"
              labelClassName="text-xs text-gray-600 sm:text-sm"
            />
            <Stepper
              label="Passengers"
              icon={<Users width={14} height={14} className="sm:size-4" />}
              value={passengers}
              min={1}
              max={vehicleCategory.passengerCount * vehicleCount}
              onChange={onPassengersChange}
              className="flex-col gap-1 sm:flex-row sm:gap-2"
              labelClassName="text-xs text-gray-600 sm:text-sm"
            />
            <Stepper
              label="Bags"
              icon={<Luggage width={14} height={14} className="sm:size-4" />}
              value={bags}
              min={0}
              max={vehicleCategory.luggageCount * vehicleCount}
              onChange={onBagsChange}
              className="flex-col gap-1 sm:flex-row sm:gap-2"
              labelClassName="text-xs text-gray-600 sm:text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
