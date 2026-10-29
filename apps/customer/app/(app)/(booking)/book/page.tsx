"use client";

import { Suspense, useMemo, type ReactNode } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Breadcrumbs } from "@usa-limousine-corporation/ui/layout/breadcrumbs";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@usa-limousine-corporation/ui/components/card";
import { BOOKING_TYPE_LABELS } from "@usa-limousine-corporation/ui/components/bookings/labels";
import type { CreateInput } from "@usa-limousine-corporation/ui/types/booking-model";
import { formatPrice } from "@usa-limousine-corporation/ui/utils/price";
import { Calendar, CalendarClock, Car, Location, User } from "@usa-limousine-corporation/ui/svg";
import { useCreateBooking } from "@/hooks/queries/use-bookings";

/** Booking request built on the public website, passed here as the `draft` query param. */
type Draft = CreateInput & { vehicleCategoryName?: string };

const crumbs = [
  { label: "Home", href: "/dashboard" },
  { label: "Bookings", href: "/bookings" },
  { label: "Confirm booking" },
];

function parseDraft(raw: string | null): Draft | null {
  if (!raw) return null;
  try {
    const draft = JSON.parse(raw) as Draft;
    const valid =
      typeof draft.vehicleCategoryId === "string" &&
      typeof draft.address?.pickup?.address === "string" &&
      typeof draft.passenger?.name === "string" &&
      typeof draft.bookingTime?.pickupDate === "string" &&
      typeof draft.pricing?.total === "number";
    return valid ? draft : null;
  } catch {
    return null;
  }
}

/** Only the fields the API accepts; it rejects unknown properties. */
function toCreateInput(draft: Draft): CreateInput {
  return {
    vehicleCategoryId: draft.vehicleCategoryId,
    vehicleCount: draft.vehicleCount,
    bookingType: draft.bookingType,
    address: draft.address,
    passenger: draft.passenger,
    bookingTime: draft.bookingTime,
    flightDetails: draft.flightDetails,
    meetAndGreet: draft.meetAndGreet,
    extraServices: draft.extraServices,
    luggage: draft.luggage,
    notes: draft.notes,
    pricing: draft.pricing,
  };
}

function SummaryRow(props: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <div className="flex w-[120px] shrink-0 items-center gap-2">
        {props.icon}
        <span className="text-sm font-semibold text-default-800">{props.label}</span>
      </div>
      <div className="min-w-0 flex-1 text-sm text-default-700">{props.children}</div>
    </li>
  );
}

function ConfirmBooking() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const draft = useMemo(() => parseDraft(searchParams.get("draft")), [searchParams]);
  const createMutation = useCreateBooking();

  if (!draft) {
    return (
      <Card className="border border-border shadow-xs">
        <CardContent className="space-y-3 p-6">
          <h2 className="text-lg font-bold text-default-900">No booking to confirm</h2>
          <p className="text-sm text-default-500">
            Start a booking on our website, then you will be brought back here to confirm it.
          </p>
          <Button asChild size="sm" variant="outline">
            <Link href="/bookings">View my bookings</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const icon = "h-4 w-4 shrink-0 text-primary";
  const { address, bookingTime, passenger, pricing } = draft;

  return (
    <Card className="border border-border shadow-xs">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-default-900">
          Review and confirm your booking
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 pt-2 sm:p-6 sm:pt-2">
        <ul className="space-y-3.5">
          <SummaryRow icon={<Car className={icon} />} label="Vehicle">
            {draft.vehicleCategoryName ?? "Selected vehicle"}
            {(draft.vehicleCount ?? 1) > 1 ? ` × ${draft.vehicleCount}` : ""}
            {draft.bookingType ? ` · ${BOOKING_TYPE_LABELS[draft.bookingType]}` : ""}
          </SummaryRow>
          <SummaryRow icon={<Location className={icon} />} label="Pickup">
            {address.pickup.address}
          </SummaryRow>
          {(address.stops ?? []).map((stop, index) => (
            <SummaryRow
              key={`${stop.address}-${index}`}
              icon={<Location className={icon} />}
              label={`Stop ${index + 1}`}
            >
              {stop.address}
            </SummaryRow>
          ))}
          {address.dropoff ? (
            <SummaryRow icon={<Location className={icon} />} label="Drop-off">
              {address.dropoff.address}
            </SummaryRow>
          ) : null}
          <SummaryRow icon={<Calendar className={icon} />} label="Pickup time">
            {bookingTime.pickupDate} at {bookingTime.pickupTime}
          </SummaryRow>
          {bookingTime.returnDate ? (
            <SummaryRow icon={<CalendarClock className={icon} />} label="Return">
              {bookingTime.returnDate} at {bookingTime.returnTime}
            </SummaryRow>
          ) : null}
          <SummaryRow icon={<User className={icon} />} label="Passenger">
            {passenger.name} · {passenger.passengerCount} passenger
            {passenger.passengerCount === 1 ? "" : "s"}
          </SummaryRow>
        </ul>

        <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
          <span className="text-sm font-semibold text-default-900">Estimated total</span>
          <span className="text-lg font-bold text-primary">
            {formatPrice({ price: pricing.total })}
          </span>
        </div>
        <p className="mt-2 text-xs text-default-500">
          Your booking is sent to our team as pending. We will confirm it and the final price
          shortly.
        </p>

        <div className="mt-5 flex justify-end">
          <Button
            type="button"
            disabled={createMutation.isPending || createMutation.isSuccess}
            isLoading={createMutation.isPending}
            onClick={() =>
              createMutation.mutate(toCreateInput(draft), {
                onSuccess: (booking) => router.replace(`/bookings/${booking.id}`),
              })
            }
          >
            Confirm booking
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function BookPage() {
  return (
    <div className="space-y-4">
      <Breadcrumbs items={crumbs} />
      <Suspense fallback={null}>
        <ConfirmBooking />
      </Suspense>
    </div>
  );
}
