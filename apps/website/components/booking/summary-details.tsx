"use client";

import { useMemo, useState } from "react";
import { useBookingStore, usePricing } from "@/store/use-booking-store";
import { PriceRow } from "@usa-limousine-corporation/ui/bookings/price-row";
import { BookingLocationDetails } from "@usa-limousine-corporation/ui/bookings/booking-location-details";
import {
  calculateArrivalTime,
  formatDate,
  formatPrice,
  formatDistance,
  formatDuration,
  formatHrs,
  formatTime,
  cn,
} from "@/lib/utils";
import { Car, Luggage, Pencil, Users } from "@usa-limousine-corporation/ui/svg";
import Image from "next/image";
import { EditBookingModal } from "./modals/edit-booking-modal";
import { useHasHydrated } from "@/hooks/use-has-hydrated";
import { TRIP_TYPES } from "@/constants/booking-constants";

function getChildSeatLabel(name: string) {
  const shortName = name.split("(")[0]?.trim();
  return shortName || name;
}

type Props = {
  className?: string;
};

function SummaryDetails({ className }: Props = {}) {
  const hasHydrated = useHasHydrated();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { step1, step2, step3 } = useBookingStore();
  const pricing = usePricing();
  const selectedCategory = step2?.vehicleCategory;
  const vehicleCount = step2?.vehicleCount ?? 1;

  const stops = useMemo(
    () => (step1?.stops ?? []).map((stop) => stop.address.trim()).filter(Boolean),
    [step1?.stops],
  );

  const pickupDate = (step3?.pickupDate || "").trim();
  const pickupTime = (step3?.pickupTime || "").trim();
  const hasPickupTime = Boolean(pickupTime);
  const formattedPickupDate = useMemo(() => formatDate(pickupDate), [pickupDate]);

  const isHourly = step1?.tripType === TRIP_TYPES.HOURLY;
  const hireDuration = isHourly && step1?.duration ? formatHrs(step1.duration) : null;

  const deliveryTime = useMemo(
    () =>
      isHourly
        ? null
        : calculateArrivalTime({
            time: pickupTime,
            durationMinutes: step1?.travelDuration,
          }),
    [isHourly, pickupTime, step1?.travelDuration],
  );

  const estDistance = useMemo(
    () => (isHourly ? null : formatDistance(step1?.distance)),
    [isHourly, step1?.distance],
  );
  const estDuration = useMemo(
    () => (isHourly ? null : formatDuration(step1?.travelDuration)),
    [isHourly, step1?.travelDuration],
  );

  const returnEnabled = Boolean(step3?.returnEnabled);
  const stopCount = stops.length;
  const oneWayChildSeats = (step3?.childSeats ?? []).filter((seat) => seat.quantity > 0);
  const returnChildSeats = returnEnabled
    ? (step3?.returnChildSeats ?? []).filter((seat) => seat.quantity > 0)
    : [];

  if (!hasHydrated) return null;

  return (
    <>
      <div
        className={cn(
          "mx-auto mt-0 w-full rounded-none border border-border bg-white p-4 shadow-sm sm:p-5 lg:rounded-sm",
          className,
        )}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-black">Summary Details</h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="cursor-pointer flex items-center gap-1.5 text-sm font-medium text-secondary hover:text-black transition-colors"
              aria-label="Edit Booking"
            >
              <Pencil className="h-4 w-4" />
              <span>Edit</span>
            </button>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Trip Type</span>
              <span className="text-sm text-gray-500">
                {isHourly ? "By the Hour" : returnEnabled ? "Return" : "One Way"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Date</span>
              <span className="text-sm text-gray-500">{formattedPickupDate}</span>
            </div>
          </div>

          <BookingLocationDetails
            pickupLocation={step1?.pickupAddress}
            dropoffLocation={step1?.deliveryAddress}
            stops={stops}
            isHourly={isHourly}
            durationLabel={hireDuration}
            pickupTime={hasPickupTime ? formatTime(pickupTime) : undefined}
            dropoffTime={hasPickupTime && deliveryTime !== "—" ? deliveryTime : undefined}
            note={[estDuration, estDistance].filter(Boolean).map((value) => `~ ${value}`).join(" · ")}
            variant="plain"
            className="border-t border-gray-100 pt-3"
          />

          {selectedCategory ? (
            <div className="space-y-3 border-y border-gray-100 py-2">
              <h3 className="text-sm font-semibold text-black">Your Choice</h3>
              <div className="flex items-center gap-4">
                <div className="relative flex h-12 w-20 flex-shrink-0 items-center justify-center">
                  {selectedCategory.image ? (
                    <Image
                      src={selectedCategory.image}
                      alt={selectedCategory.name}
                      fill
                      className="object-contain"
                    />
                  ) : (
                    <Car className="h-9 w-9 text-gray-300" aria-hidden />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="mb-1 truncate text-base font-medium leading-none text-foreground">
                    {selectedCategory.name}
                    {vehicleCount > 1 ? ` × ${vehicleCount}` : ""}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <div
                      className="flex shrink-0 items-center gap-x-1 rounded-full bg-secondary px-4 py-1 text-white"
                      title="Passengers"
                    >
                      <Users className="h-4 w-4" />
                      <span className="text-sm font-bold">{selectedCategory.passengerCount * vehicleCount}</span>
                    </div>
                    <div
                      className="flex shrink-0 items-center gap-x-1 rounded-full bg-secondary px-4 py-1 text-white"
                      title="Suitcases"
                    >
                      <Luggage className="h-4 w-4" />
                      <span className="text-sm font-bold">{selectedCategory.luggageCount * vehicleCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {pricing ? (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-black">Price Details</h3>

              <div className="space-y-2 text-sm">
                <PriceRow format={formatPrice} label="Base Price" value={pricing.oneWayBasePrice} />
                <PriceRow
                  format={formatPrice}
                  label={`Discount (${pricing.oneWayDiscountPercentage}%)`}
                  value={pricing.oneWayDiscountAmount}
                  destructive
                />
                {pricing.oneWaySurchargeAmount > 0 && (
                  <PriceRow
                    format={formatPrice}
                    label={`Fuel Surcharge (${pricing.oneWaySurchargePercentage}%)`}
                    value={pricing.oneWaySurchargeAmount}
                  />
                )}
                <PriceRow
                  format={formatPrice}
                  label={`Gratuity (${pricing.oneWayGratuityPercentage}%)`}
                  value={pricing.oneWayGratuityAmount}
                />
                <PriceRow
                  format={formatPrice}
                  label={`Tax (${pricing.oneWayTaxPercentage}%)`}
                  value={pricing.oneWayTaxAmount}
                />
                <PriceRow
                  format={formatPrice}
                  label={`Transaction Fee (${pricing.oneWayTransactionFeePercentage}%)`}
                  value={pricing.oneWayTransactionFeeAmount}
                />
                <PriceRow
                  format={formatPrice}
                  label="Airport Pickup"
                  value={pricing.oneWayAirportFeeAmount}
                />

                <PriceRow
                  format={formatPrice}
                  label="Return Base Price"
                  value={pricing.returnBasePrice}
                />
                <PriceRow
                  format={formatPrice}
                  label={`Return Discount (${pricing.returnDiscountPercentage}%)`}
                  value={pricing.returnDiscountAmount}
                  destructive
                />
                {pricing.returnSurchargeAmount > 0 && (
                  <PriceRow
                    format={formatPrice}
                    label={`Return Fuel Surcharge (${pricing.returnSurchargePercentage}%)`}
                    value={pricing.returnSurchargeAmount}
                  />
                )}
                <PriceRow
                  format={formatPrice}
                  label={`Return Gratuity (${pricing.returnGratuityPercentage}%)`}
                  value={pricing.returnGratuityAmount}
                />
                <PriceRow
                  format={formatPrice}
                  label={`Return Tax (${pricing.returnTaxPercentage}%)`}
                  value={pricing.returnTaxAmount}
                />
                <PriceRow
                  format={formatPrice}
                  label={`Return Transaction Fee (${pricing.returnTransactionFeePercentage}%)`}
                  value={pricing.returnTransactionFeeAmount}
                />
                <PriceRow
                  format={formatPrice}
                  label="Return Airport Pickup"
                  value={pricing.returnAirportFeeAmount}
                />

                <PriceRow
                  format={formatPrice}
                  label={`Additional Stops (${stopCount})`}
                  value={pricing.stopFeeAmount}
                />
                <PriceRow
                  format={formatPrice}
                  label="Extra Luggage"
                  value={pricing.luggageFeeAmount}
                />
                <PriceRow
                  format={formatPrice}
                  label="Meet & Greet Service"
                  value={pricing.oneWayMeetAndGreetFeeAmount}
                />
                {oneWayChildSeats.map((seat) => (
                  <div
                    key={seat.id}
                    className="flex items-center justify-between gap-3 font-normal text-gray-500"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="truncate">{getChildSeatLabel(seat.name)}</span>
                      <span className="inline-flex shrink-0 items-center rounded-full bg-secondary/10 px-2 py-0.5 text-2xs font-semibold leading-none text-secondary">
                        ×{seat.quantity}
                      </span>
                    </span>
                    <span className="shrink-0 font-medium text-gray-800">
                      {formatPrice(seat.price * seat.quantity)}
                    </span>
                  </div>
                ))}
                <PriceRow
                  format={formatPrice}
                  label="Return Meet & Greet Service"
                  value={pricing.returnMeetAndGreetFeeAmount}
                />
                {returnChildSeats.map((seat) => (
                  <div
                    key={`return-${seat.id}`}
                    className="flex items-center justify-between gap-3 font-normal text-gray-500"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="truncate">Return {getChildSeatLabel(seat.name)}</span>
                      <span className="inline-flex shrink-0 items-center rounded-full bg-secondary/10 px-2 py-0.5 text-2xs font-semibold leading-none text-secondary">
                        ×{seat.quantity}
                      </span>
                    </span>
                    <span className="shrink-0 font-medium text-gray-800">
                      {formatPrice(seat.price * seat.quantity)}
                    </span>
                  </div>
                ))}

                <div className="flex items-center justify-between border-t border-gray-100 pt-2.5">
                  <span className="text-base font-semibold leading-none text-gray-800">Total</span>
                  <span className="text-2xl font-semibold leading-none text-secondary">
                    {formatPrice(pricing.total)}
                  </span>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <EditBookingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}

export default SummaryDetails;
