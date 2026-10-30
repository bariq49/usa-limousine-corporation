"use client";

import { useState } from "react";
import { PLATFORM } from "@usa-limousine-corporation/config";
import Link from "next/link";
import { Button } from "../button";
import { ChevronDown, Close, Eye, Pencil, Users } from "../../svg";
import { cn } from "../../utils/cn";
import { calculateArrivalTime, formatDate, formatTime } from "../../utils/date";
import { formatDistance } from "../../utils/distance";
import { formatDuration, formatHrs } from "../../utils/duration";
import { BookingLocationDetails } from "./booking-location-details";
import { BookingPaymentSummary } from "./booking-payment-summary";
import { BOOKING_TYPE_LABELS } from "./labels";
import type { BookingCardProps } from "../../types/bookings";

export function BookingCard(props: BookingCardProps) {
  const { booking, detailsHref, onCancel, onEdit, className } = props;
  const [showPrice, setShowPrice] = useState(false);
  const isHourly = booking.bookingType === "HOURLY";
  const { pickupDate, pickupTime, returnDate, returnTime } = booking.bookingTime;
  const travelMinutes = isHourly ? undefined : (booking.address?.travelDuration ?? undefined);
  const arrivalTime =
    !isHourly && pickupTime && travelMinutes != null
      ? calculateArrivalTime({ time: pickupTime, durationMinutes: travelMinutes })
      : null;
  const passengers = booking.passenger?.passengerCount ?? 1;

  return (
    <article
      className={cn(
        "flex h-full flex-col gap-4 max-md:border-b max-md:border-border max-md:pb-6 max-md:last:border-b-0 md:rounded-md md:bg-default-100 md:p-5",
        className,
      )}
    >
      <div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <h3 className="truncate text-lg font-bold text-default-900">{booking.bookingNumber}</h3>
          </div>
          {onEdit ? (
            <button
              type="button"
              onClick={onEdit}
              className="shrink-0 cursor-pointer text-default-600 transition-colors hover:text-default-900"
              aria-label="Edit booking"
            >
              <Pencil className="h-4.5 w-4.5" />
            </button>
          ) : null}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-default-600">
          <span>
            {formatDate({ date: pickupDate })} · {formatTime({ date: pickupTime })}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {passengers} {passengers === 1 ? "Passenger" : "Passengers"}
          </span>
          <span>{BOOKING_TYPE_LABELS[booking.bookingType]}</span>
          {returnDate ? (
            <span>
              Return {formatDate({ date: returnDate })}
              {returnTime ? ` · ${formatTime({ date: returnTime })}` : ""}
            </span>
          ) : null}
        </div>
      </div>

      <BookingLocationDetails
        pickupLocation={booking.address?.pickup?.address}
        dropoffLocation={booking.address?.dropoff?.address}
        stops={(booking.address?.stops ?? []).map((stop) => stop.address)}
        isHourly={isHourly}
        durationLabel={
          isHourly && booking.address?.hourlyDuration != null
            ? formatHrs({ hours: booking.address.hourlyDuration })
            : undefined
        }
        pickupTime={pickupTime ? formatTime({ date: pickupTime }) : undefined}
        dropoffTime={arrivalTime && arrivalTime !== "—" ? arrivalTime : undefined}
        note={
          isHourly
            ? undefined
            : [
                travelMinutes != null ? formatDuration({ minutes: travelMinutes }) : null,
                booking.address?.distance != null
                  ? formatDistance({ distance: booking.address.distance })
                  : null,
              ]
                .filter(Boolean)
                .map((value) => `~ ${value}`)
                .join(" · ")
        }
        variant="plain"
        className="border-t border-border pt-3"
      />

      <div className="border-t border-border pt-3">
        <div className="flex items-end justify-between">
          <span className="text-sm font-semibold text-default-900">Total</span>
          <span className="flex items-baseline gap-1 leading-none text-default-900">
            <span className="text-sm font-medium text-default-500">
              {PLATFORM.locale.currencySymbol}
            </span>
            <span className="text-2xl font-semibold tracking-tight">
              {booking.totalPrice.toFixed(2)}
            </span>
          </span>
        </div>
        <p className="mt-2 text-xs font-medium text-default-500">
          All prices include taxes, gratuity &amp; fees
        </p>
        <button
          type="button"
          aria-expanded={showPrice}
          onClick={() => setShowPrice(!showPrice)}
          className="mt-3 flex w-full cursor-pointer items-center justify-between text-sm font-semibold text-default-900"
        >
          Price details
          <ChevronDown
            className={cn("h-4 w-4 transition-transform duration-200", showPrice && "rotate-180")}
          />
        </button>
        {showPrice ? (
          <div className="mt-1.5">
            <BookingPaymentSummary booking={booking} variant="plain" />
          </div>
        ) : null}
      </div>

      <div className="mt-auto grid auto-cols-fr grid-flow-col gap-2">
        <Button asChild variant="outline" className="h-11 gap-1.5 px-2">
          <Link href={detailsHref}>
            <Eye className="h-4 w-4" />
            Details
          </Link>
        </Button>
        {onCancel ? (
          <Button
            type="button"
            variant="outline"
            color="destructive"
            className="h-11 gap-1.5 px-2"
            onClick={onCancel}
          >
            <Close className="h-4 w-4" />
            Cancel
          </Button>
        ) : null}
      </div>
    </article>
  );
}
