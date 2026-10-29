"use client";

import { useMemo, useState } from "react";
import { useTimeFormat } from "@usa-limousine-corporation/ui/store/time-format";
import { useBookingStore, usePricing } from "@/store/use-booking-store";
import { BookingLocationDetails } from "@usa-limousine-corporation/ui/bookings/booking-location-details";
import { cn } from "@usa-limousine-corporation/ui/utils/cn";
import { PriceRow } from "@usa-limousine-corporation/ui/bookings/price-row";
import type { LegPricing } from "@usa-limousine-corporation/ui/bookings/types";
import {
  Amex,
  ApplePay,
  ArrowLeftRight,
  Check,
  ChevronDown,
  Discover,
  GooglePay,
  Mastercard,
  Pencil,
  PlaneOutline,
  ShieldCheckOutline,
  CircleUser,
  Users,
  Visa,
} from "@usa-limousine-corporation/ui/svg";
import {
  calculateArrivalTime,
  formatDate,
  formatTime,
  shiftDateTime,
} from "@usa-limousine-corporation/ui/utils/date";
import { formatDistance } from "@usa-limousine-corporation/ui/utils/distance";
import { formatDuration, formatHrs } from "@usa-limousine-corporation/ui/utils/duration";
import { formatPrice } from "@usa-limousine-corporation/ui/utils/price";
import { useSettings } from "@/hooks/queries/use-settings";
import { EditBookingModal } from "./modals/edit-booking-modal";
import { ReturnTripModal } from "./modals/return-trip-modal";
import { useHasHydrated } from "@/hooks/use-has-hydrated";
import { TRIP_TYPES } from "@/constants/booking-constants";
import { PLATFORM } from "@usa-limousine-corporation/config";

function getChildSeatLabel(name: string) {
  const shortName = name.split("(")[0]?.trim();
  return shortName || name;
}

type SummaryDetailsProps = {
  className?: string;
};

type SummaryLine = { id: string; name: string; quantity: number; total: number };

function SummaryDetails(props: SummaryDetailsProps = {}) {
  const { className } = props;
  const hasHydrated = useHasHydrated();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isPriceDetailsOpen, setIsPriceDetailsOpen] = useState(false);
  const { step1, returnTrip, step2, setReturnTrip } = useBookingStore();
  const hourCycle = useTimeFormat((state) => state.hourCycle);
  const pricing = usePricing();
  const { data: settings } = useSettings();

  const stops = useMemo(
    () => (step1?.stops ?? []).map((stop) => stop.address.trim()).filter(Boolean),
    [step1?.stops],
  );

  const pickupDate = (step1?.pickupDate || "").trim();
  const pickupTime = (step1?.pickupTime || "").trim();
  const hasPickupTime = Boolean(pickupTime);
  const formattedPickupDate = useMemo(() => formatDate({ date: pickupDate }), [pickupDate]);

  const isHourly = step1?.tripType === TRIP_TYPES.HOURLY;
  const hireDuration = isHourly && step1?.hourlyDuration
    ? formatHrs({ hours: step1.hourlyDuration })
    : undefined;

  const deliveryTime = useMemo(
    () =>
      isHourly
        ? null
        : calculateArrivalTime({
            hourCycle,
            time: pickupTime,
            durationMinutes: step1?.travelDuration,
          }),
    [isHourly, pickupTime, step1?.travelDuration, hourCycle],
  );

  const distance = step1?.distance;
  const estDistance = useMemo(
    () =>
      isHourly || !distance
        ? null
        : `${(distance * 1.60934).toFixed(1)} km / ${formatDistance({ distance })}`,
    [isHourly, distance],
  );
  const estDuration = useMemo(
    () =>
      isHourly || !step1?.travelDuration
        ? undefined
        : formatDuration({ minutes: step1.travelDuration }),
    [isHourly, step1?.travelDuration],
  );

  const returnEnabled = Boolean(returnTrip);
  const stopCount = stops.length;
  const cancellationRefundRate = settings?.cancellationRefundRate ?? 0;
  const cancellationAt = shiftDateTime({
    date: pickupDate,
    time: pickupTime,
    minutes: -(settings?.cancellationMinutes ?? 0),
  });
  const cancellationDeadline = cancellationAt
    ? `${formatDate({
        date: cancellationAt.date,
        options: { day: "numeric", month: "long", year: "numeric" },
      })}, ${formatTime({ date: cancellationAt.time, hourCycle })}`
    : null;
  const returnTime = (returnTrip?.returnTime || "").trim();
  const formattedReturnDate = formatDate({ date: (returnTrip?.returnDate || "").trim() });
  const returnArrivalTime = calculateArrivalTime({
    hourCycle,
    time: returnTime,
    durationMinutes: step1?.travelDuration,
  });

  const rates = pricing?.rates;
  const extraLines = (pricing?.items ?? []).filter((line) => line.type === "EXTRA_SERVICE");
  const oneWayExtras: SummaryLine[] = extraLines
    .filter((line) => line.quantity > 0)
    .map((line) => ({
      id: line.id,
      name: line.name,
      quantity: line.quantity,
      total: line.unitPrice * line.quantity,
    }));
  const returnExtras: SummaryLine[] = extraLines
    .filter((line) => line.returnQuantity > 0)
    .map((line) => ({
      id: line.id,
      name: line.name,
      quantity: line.returnQuantity,
      total: line.unitPrice * line.returnQuantity,
    }));
  const luggageLines: SummaryLine[] = (pricing?.items ?? [])
    .filter((line) => line.type === "LUGGAGE")
    .map((line) => ({ id: line.id, name: line.name, quantity: line.quantity, total: line.total }));

  const lineRows = (prefix: string, lines: SummaryLine[]) =>
    lines.map((line) => (
      <div
        key={`${prefix}${line.id}`}
        className="flex items-center justify-between gap-3 font-medium text-gray-600"
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className="truncate">
            {prefix}
            {getChildSeatLabel(line.name)}
          </span>
          <span className="inline-flex shrink-0 items-center rounded-full bg-secondary/10 px-2 py-0.5 text-2xs font-semibold leading-none text-secondary">
            ×{line.quantity}
          </span>
        </span>
        <span className="shrink-0 font-medium text-black">{formatPrice({ price: line.total })}</span>
      </div>
    ));

  const legRows = (
    prefix: string,
    leg: LegPricing,
    discountRate: number | undefined,
    extras: SummaryLine[],
  ) => (
    <>
      <PriceRow label={`${prefix}Base Price`} value={leg.basePrice} />
      <PriceRow
        label={`${prefix}Fuel Surcharge (${rates?.fuelSurchargeRate ?? 0}%)`}
        value={leg.fuelSurchargePrice}
      />
      <PriceRow
        label={`${prefix}Gratuity (${rates?.gratuityRate ?? 0}%)`}
        value={leg.gratuityPrice}
      />
      <PriceRow label={`${prefix}Tax (${rates?.taxRate ?? 0}%)`} value={leg.taxPrice} />
      <PriceRow
        label={`${prefix}Transaction Fee (${rates?.transactionFeeRate ?? 0}%)`}
        value={leg.transactionFeePrice}
      />
      <PriceRow
        label={`${prefix}Discount (${discountRate ?? 0}%)`}
        value={leg.discountPrice}
        destructive
      />
      <PriceRow label={`${prefix}Airport Pickup`} value={leg.airportPickupPrice} />
      <PriceRow
        label={`${prefix}Meet & Greet Service`}
        value={leg.meetAndGreetPrice ?? 0}
      />
      {lineRows(prefix, extras)}
    </>
  );

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
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-black">Your Booking</h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="cursor-pointer text-gray-600 transition-colors hover:text-black"
                aria-label="Edit Booking"
              >
                <Pencil className="h-4.5 w-4.5" />
              </button>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600">
              <span>{formattedPickupDate}</span>
              {step2 ? (
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {step2.passengers} {step2.passengers === 1 ? "Passenger" : "Passengers"}
                </span>
              ) : null}
              {returnEnabled ? <span>Round trip</span> : null}
            </div>
          </div>

          <BookingLocationDetails
            pickupLocation={step1?.pickupAddress}
            dropoffLocation={step1?.deliveryAddress}
            stops={stops}
            isHourly={isHourly}
            durationLabel={hireDuration}
            pickupTime={hasPickupTime ? formatTime({ date: pickupTime, hourCycle }) : undefined}
            dropoffTime={hasPickupTime && deliveryTime !== "—" ? deliveryTime : undefined}
            note={[estDuration, estDistance]
              .filter(Boolean)
              .map((value) => `~ ${value}`)
              .join(" · ")}
            variant="plain"
            className="border-t border-gray-100 pt-3"
          />

          {returnEnabled && !isHourly ? (
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-black">Return</p>
                <p className="text-xs text-gray-600">{formattedReturnDate}</p>
              </div>
              <BookingLocationDetails
                pickupLocation={step1?.deliveryAddress}
                dropoffLocation={step1?.pickupAddress}
                stops={stops.slice().reverse()}
                pickupTime={returnTime ? formatTime({ date: returnTime, hourCycle }) : undefined}
                dropoffTime={
                  returnTime && returnArrivalTime !== "—" ? returnArrivalTime : undefined
                }
                note={[estDuration, estDistance]
                  .filter(Boolean)
                  .map((value) => `~ ${value}`)
                  .join(" · ")}
                variant="plain"
              />
            </div>
          ) : null}

          {!isHourly && step2 ? (
            <button
              type="button"
              onClick={() => (returnEnabled ? setReturnTrip(null) : setIsReturnModalOpen(true))}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-gray-100 py-2.5 text-sm font-medium text-black transition-colors hover:bg-gray-200"
            >
              <ArrowLeftRight className="h-4 w-4 text-secondary" />
              {returnEnabled ? "Remove return" : "Add return"}
            </button>
          ) : null}

          {pricing ? (
            <div className="border-t border-gray-100 pt-3">
              <div className="flex items-end justify-between">
                <span className="text-sm font-semibold text-black">Total</span>
                <span className="flex items-baseline gap-1 leading-none text-black">
                  <span className="text-sm font-medium text-gray-600">{PLATFORM.locale.currencySymbol}</span>
                  <span className="text-2xl font-semibold tracking-tight">
                    {pricing.total.toFixed(2)}
                  </span>
                </span>
              </div>
              <p className="mt-2 text-xs font-medium text-gray-500">
                All prices include taxes, gratuity &amp; fees
              </p>

              <button
                type="button"
                onClick={() => setIsPriceDetailsOpen(!isPriceDetailsOpen)}
                className="mt-3 flex w-full cursor-pointer items-center justify-between text-sm font-semibold text-black"
              >
                Price details
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    isPriceDetailsOpen && "rotate-180",
                  )}
                />
              </button>

              {isPriceDetailsOpen ? (
                <div className="mt-1.5 space-y-1 text-caption animate-in fade-in slide-in-from-top-1 duration-200">
                  {pricing.legs ? (
                    <>
                      {legRows("", pricing.legs.oneWay, rates?.oneWayDiscountRate, oneWayExtras)}
                      {legRows(
                        "Return ",
                        pricing.legs.returnTrip,
                        rates?.returnDiscountRate,
                        returnExtras,
                      )}
                    </>
                  ) : (
                    legRows(
                      "",
                      {
                        basePrice: pricing.basePrice ?? 0,
                        fuelSurchargePrice: pricing.fuelSurchargePrice ?? 0,
                        gratuityPrice: pricing.gratuityPrice ?? 0,
                        taxPrice: pricing.taxPrice ?? 0,
                        transactionFeePrice: pricing.transactionFeePrice ?? 0,
                        discountPrice: pricing.discountPrice ?? 0,
                        airportPickupPrice: pricing.airportPickupPrice ?? 0,
                        meetAndGreetPrice: pricing.meetAndGreetPrice ?? 0,
                        total: pricing.total,
                      },
                      rates?.oneWayDiscountRate,
                      oneWayExtras,
                    )
                  )}
                  <PriceRow
                    label={`Additional Stops (${stopCount})`}
                    value={pricing.stopsPrice ?? 0}
                  />
                  {lineRows("", luggageLines)}
                  <PriceRow label="Notifications" value={pricing.notificationsPrice ?? 0} />

                  <div className="flex items-end justify-between border-t border-gray-100 pt-2">
                    <span className="text-sm font-semibold text-black">Total price</span>
                    <span className="flex items-baseline gap-1 leading-none text-black">
                      <span className="text-sm font-medium text-gray-600">{PLATFORM.locale.currencySymbol}</span>
                      <span className="text-2xl font-semibold tracking-tight">
                        {pricing.total.toFixed(2)}
                      </span>
                    </span>
                  </div>
                </div>
              ) : null}

              {cancellationRefundRate > 0 && cancellationDeadline ? (
                <div className="mt-4 rounded-md bg-success/10 px-4 py-3">
                  <p className="flex items-center gap-2 text-sm font-semibold text-success">
                    <ShieldCheckOutline className="h-5 w-5" />
                    {cancellationRefundRate >= 100 ? "Free cancellation" : "Flexible cancellation"}
                  </p>
                  <p className="mt-1 pl-7 text-xs font-medium text-gray-700">
                    {cancellationRefundRate >= 100
                      ? "Full refund"
                      : `${cancellationRefundRate}% refund`}{" "}
                    until {cancellationDeadline}.
                  </p>
                </div>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-gray-700">
                <span className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5" />
                  Door-to-door service
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5" />
                  Meet &amp; Greet
                </span>
                <span className="flex items-center gap-1.5">
                  <PlaneOutline className="h-3.5 w-3.5" />
                  Flight tracking
                </span>
                <span className="flex items-center gap-1.5">
                  <CircleUser className="h-3.5 w-3.5" />
                  Licensed chauffeurs
                </span>
              </div>

              <div
                className="mt-4 flex flex-wrap items-center justify-between gap-2 text-gray-600"
                aria-label="Accepted payment methods"
              >
                <Visa className="h-7 w-11" aria-label="Visa" />
                <Mastercard className="h-7 w-11" aria-label="Mastercard" />
                <Amex className="h-7 w-11" aria-label="American Express" />
                <Discover className="h-7 w-11" aria-label="Discover" />
                <ApplePay className="h-7 w-11" aria-label="Apple Pay" />
                <GooglePay className="h-7 w-11" aria-label="Google Pay" />
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <EditBookingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <ReturnTripModal isOpen={isReturnModalOpen} onClose={() => setIsReturnModalOpen(false)} />
    </>
  );
}

export default SummaryDetails;
