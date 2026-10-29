"use client";

import Image from "next/image";
import {
  Car,
  CircleHelp,
  Luggage,
  Users,
} from "../../svg";
import { cn } from "../../utils/cn";
import { Stepper } from "../stepper";
import { MAX_VEHICLES } from "../../constants/booking";
import type { VehicleCategoryCardProps } from "../../types/bookings";
import { formatPrice } from "../../utils/price";

export default function VehicleCategoryCard({
  vehicleCategory,
  estimate,
  isPricing = false,
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
  const pricing = estimate?.pricing;
  const waitingForPrice = !estimate && !isPricing;
  const totalPrice = estimate?.total ?? 0;
  const discountAmount = pricing?.discountPrice ?? 0;
  const priceBeforeDiscount = totalPrice + discountAmount;
  const discountPercentage =
    priceBeforeDiscount > 0 ? Math.round((discountAmount / priceBeforeDiscount) * 100) : 0;
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
                {isPricing ? (
                  <div className="h-8 w-24 animate-pulse rounded-sm bg-gray-100" aria-label="Pricing" />
                ) : waitingForPrice ? (
                  <span className="text-sm font-semibold text-secondary">Getting price…</span>
                ) : (
                  <div className="flex flex-col items-end gap-1">
                    {hasDiscount && (
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <span className="text-gray-400 line-through">
                          {formatPrice({ price: priceBeforeDiscount })}
                        </span>
                        <span className="font-semibold text-success">-{discountPercentage}%</span>
                      </div>
                    )}
                    <span className="text-2xl font-semibold leading-none tracking-tight text-black sm:text-3xl">
                      {formatPrice({ price: totalPrice })}
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
