"use client";

import { useRouter } from "next/navigation";
import type { ComponentType, ReactNode, SVGProps } from "react";
import { ArrowLeft, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Badge } from "../components/badge";
import { Button } from "../components/button";
import {
  Calendar,
  CalendarCheck,
  CalendarClock,
  Globe,
  Map,
  Stroller,
  Tag,
  UserList,
  UserPlus,
  UserSign,
} from "../svg";
import { BookingCustomerDetails } from "./booking-customer-details";
import { BookingLocationDetails } from "./booking-location-details";
import { BookingPaymentSummary } from "./booking-payment-summary";
import { BookingRouteMap } from "./booking-route-map";
import { BookingVehicleDetails } from "./booking-vehicle-details";
import { DetailItem } from "./detail-item";
import { getLuggageIcon } from "./luggage-icon";
import { formatDate, formatTime } from "../utils/date";
import { formatDistance } from "../utils/distance";
import { formatDuration } from "../utils/duration";
import type { Item } from "./types";
import {
  BOOKING_STATUS_DESCRIPTIONS,
  BOOKING_STATUS_HEADINGS,
  BOOKING_STATUS_LABELS,
  BOOKING_TYPE_LABELS,
  bookingStatusBadgeColor,
} from "./labels";

type SvgIcon = ComponentType<SVGProps<SVGSVGElement>>;

function preferenceIcon(Icon: SvgIcon) {
  return <Icon className="h-5 w-5" />;
}

function getSeatIcon(name?: string): SvgIcon {
  const key = (name || "").toLowerCase();
  if (key.includes("booster")) return UserPlus;
  return Stroller;
}

function BookingStatusIcon({ status }: { status: Item["status"] }) {
  if (status === "CANCELLED") {
    return (
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 sm:h-16 sm:w-16">
        <XCircle className="h-8 w-8 text-destructive sm:h-9 sm:w-9" strokeWidth={1.75} />
      </div>
    );
  }

  if (status === "PENDING") {
    return (
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-warning/10 sm:h-16 sm:w-16">
        <Clock className="h-8 w-8 text-warning sm:h-9 sm:w-9" strokeWidth={1.75} />
      </div>
    );
  }

  if (status === "COMPLETED") {
    return (
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 sm:h-16 sm:w-16">
        <CheckCircle2 className="h-8 w-8 text-emerald-600 sm:h-9 sm:w-9" strokeWidth={1.75} />
      </div>
    );
  }

  return (
    <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 sm:h-16 sm:w-16">
      <CheckCircle2 className="h-8 w-8 text-primary sm:h-9 sm:w-9" strokeWidth={1.75} />
    </div>
  );
}

type Props = {
  booking: Item;
  /** Buttons shown next to the header (e.g. Confirm / Complete / Cancel). */
  actions?: ReactNode;
};

export function BookingDetailView(props: Props) {
  const { booking } = props;
  const router = useRouter();

  const isHourly = booking.bookingType === "HOURLY";
  const luggageItems = (booking.luggage ?? []).filter((item) => item.quantity > 0);
  const childSeats = (booking.extraServices ?? []).filter(
    (item) => item.extraService?.type === "CHILD_SEAT",
  );
  const otherExtras = (booking.extraServices ?? []).filter(
    (item) => item.extraService?.type !== "CHILD_SEAT",
  );
  const meetAndGreet = booking.meetAndGreet;
  const flight = booking.flightDetails;

  return (
    <div className="space-y-4 md:space-y-5">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-10 shrink-0 gap-1.5 px-3"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="flex h-10 min-w-0 flex-1 items-center justify-between gap-2 rounded-md border border-border border-r-2 border-r-primary bg-card px-3 sm:px-4">
          <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
            <CalendarCheck className="h-5 w-5 shrink-0 text-primary" />
            <h1 className="truncate text-sm font-semibold text-default-900 sm:text-base">
              Booking Details - {booking.bookingNumber}
            </h1>
          </div>
          <Badge
            color={bookingStatusBadgeColor(booking.status)}
            variant="soft"
            className="shrink-0 text-xs font-semibold"
          >
            {BOOKING_STATUS_LABELS[booking.status]}
          </Badge>
        </div>

        {props.actions ? (
          <div className="flex shrink-0 items-center gap-2">{props.actions}</div>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-md border border-border bg-card">
        {!isHourly ? (
          <BookingRouteMap
            pickupAddress={booking.address?.pickup?.address}
            dropoffAddress={booking.address?.dropoff?.address}
            pickupTimeLabel={
              booking.bookingTime?.pickupTime
                ? formatTime({ date: booking.bookingTime.pickupTime })
                : undefined
            }
            durationMinutes={booking.address?.duration}
            className="w-full"
          />
        ) : null}

        <section className="px-3 pb-6 pt-6 sm:px-6 sm:pb-8 sm:pt-8 md:px-8">
          <div className="grid w-full items-start gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1.45fr)] lg:gap-5">
            <div className="flex h-full w-full flex-col justify-between text-left">
              <div>
                <BookingStatusIcon status={booking.status} />
                <h2 className="mt-4 text-2xl font-bold text-default-900 sm:mt-6 sm:text-3xl">
                  {BOOKING_STATUS_HEADINGS[booking.status]}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-default-600 sm:mt-3 sm:text-base">
                  {BOOKING_STATUS_DESCRIPTIONS[booking.status]}
                </p>
                {booking.status === "CANCELLED" && booking.cancellationReason ? (
                  <p className="mt-2 text-sm text-destructive">
                    Reason: {booking.cancellationReason}
                  </p>
                ) : null}
              </div>

              <div className="mt-5 flex flex-col gap-4 sm:mt-6">
                <BookingCustomerDetails passenger={booking.passenger} />
                <BookingVehicleDetails vehicleCategory={booking.vehicleCategory} />
              </div>
            </div>

            <div className="flex h-full flex-col gap-4">
              <BookingLocationDetails
                pickupLocation={booking.address?.pickup?.address}
                dropoffLocation={booking.address?.dropoff?.address}
                isHourly={isHourly}
                durationLabel={formatDuration({ minutes: booking.address?.duration })}
              />

              <section className="flex flex-1 flex-col rounded-md bg-default-100 p-4">
                <h3 className="font-bold text-default-900">Trip Preferences & Details</h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 sm:gap-5">
                  {booking.bookingTime?.pickupDate ? (
                    <DetailItem icon={preferenceIcon(Calendar)}>
                      Pickup Date: {formatDate({ date: booking.bookingTime.pickupDate })}
                    </DetailItem>
                  ) : null}
                  {booking.bookingTime?.pickupTime ? (
                    <DetailItem icon={preferenceIcon(CalendarClock)}>
                      Pickup Time: {formatTime({ date: booking.bookingTime.pickupTime })}
                    </DetailItem>
                  ) : null}
                  {booking.bookingTime?.returnDate ? (
                    <DetailItem icon={preferenceIcon(Calendar)}>
                      Return Date: {formatDate({ date: booking.bookingTime.returnDate })}
                    </DetailItem>
                  ) : null}
                  {booking.bookingTime?.returnTime ? (
                    <DetailItem icon={preferenceIcon(CalendarClock)}>
                      Return Time: {formatTime({ date: booking.bookingTime.returnTime })}
                    </DetailItem>
                  ) : null}
                  <DetailItem icon={preferenceIcon(Tag)}>
                    Trip Type: {BOOKING_TYPE_LABELS[booking.bookingType]}
                  </DetailItem>
                  {isHourly && booking.address?.duration != null ? (
                    <DetailItem icon={preferenceIcon(CalendarClock)}>
                      Hourly Duration: {formatDuration({ minutes: booking.address.duration })}
                    </DetailItem>
                  ) : null}
                  {booking.address?.distance != null ? (
                    <DetailItem icon={preferenceIcon(Map)}>
                      Distance: {formatDistance({ distance: booking.address.distance })}
                    </DetailItem>
                  ) : null}
                  {booking.passenger?.passengerCount != null ? (
                    <DetailItem icon={preferenceIcon(UserList)}>
                      Passengers: {booking.passenger.passengerCount}
                    </DetailItem>
                  ) : null}
                  {childSeats.map((item) => (
                    <DetailItem
                      key={`seat-${item.extraServiceId}`}
                      icon={preferenceIcon(getSeatIcon(item.extraService?.name))}
                    >
                      {item.extraService?.name || "Child seat"}: {item.quantity}
                    </DetailItem>
                  ))}
                  {luggageItems.map((item) => {
                    const LuggageIcon = getLuggageIcon(item.luggageType?.name);
                    return (
                      <DetailItem key={item.id} icon={preferenceIcon(LuggageIcon)}>
                        {item.luggageType?.name || "Luggage"}: {item.quantity}
                      </DetailItem>
                    );
                  })}
                  {otherExtras
                    .filter((item) => item.extraService?.type !== "MEET_AND_GREET")
                    .map((item) => (
                      <DetailItem key={`extra-${item.extraServiceId}`} icon={preferenceIcon(Tag)}>
                        {item.extraService?.name || "Extra"}: {item.quantity}
                      </DetailItem>
                    ))}
                  {flight?.flightName ? (
                    <DetailItem icon={preferenceIcon(Globe)}>
                      Airline: {flight.flightName}
                    </DetailItem>
                  ) : null}
                  {flight?.flightNumber || booking.passenger?.flightNumber ? (
                    <DetailItem icon={preferenceIcon(Globe)}>
                      Flight Number: {flight?.flightNumber || booking.passenger?.flightNumber}
                    </DetailItem>
                  ) : null}
                  {meetAndGreet?.enabled != null ? (
                    <DetailItem icon={preferenceIcon(UserSign)}>
                      Meet & Greet: {meetAndGreet.enabled ? "Yes" : "No"}
                    </DetailItem>
                  ) : null}
                  {meetAndGreet?.signName ? (
                    <DetailItem icon={preferenceIcon(UserSign)}>
                      Sign Name: {meetAndGreet.signName}
                    </DetailItem>
                  ) : null}
                </div>
              </section>
            </div>

            <div className="flex flex-col gap-4 lg:col-span-2">
              {booking.notes ? (
                <section className="rounded-md bg-default-100 p-4">
                  <h3 className="font-bold text-default-900">Notes & Special Instructions</h3>
                  <p className="mt-2 text-sm leading-relaxed text-default-700">{booking.notes}</p>
                </section>
              ) : null}

              {booking.passenger?.specialInstructions ? (
                <section className="rounded-md bg-default-100 p-4">
                  <h3 className="font-bold text-default-900">Passenger Instructions</h3>
                  <p className="mt-2 text-sm leading-relaxed text-default-700">
                    {booking.passenger.specialInstructions}
                  </p>
                </section>
              ) : null}

              {meetAndGreet?.instructions ? (
                <section className="rounded-md bg-default-100 p-4">
                  <h3 className="font-bold text-default-900">Meet & Greet Instructions</h3>
                  <p className="mt-2 text-sm leading-relaxed text-default-700">
                    {meetAndGreet.instructions}
                  </p>
                </section>
              ) : null}

              {booking.status !== "CANCELLED" ? <BookingPaymentSummary booking={booking} /> : null}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
