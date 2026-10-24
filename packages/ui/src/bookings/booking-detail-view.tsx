"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentType, ReactNode, SVGProps } from "react";
import { ArrowLeft, BadgeCheck, BadgeX, Clock } from "lucide-react";
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
import { BookingPaymentDetails } from "./booking-payment-details";
import { BookingPaymentSummary } from "./booking-payment-summary";
import { cn } from "../utils/cn";
import { AnimatedRouteMap } from "./animated-route-map";
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
  const className = "h-10 w-10 text-white drop-shadow-md sm:h-14 sm:w-14";
  if (status === "CANCELLED") {
    return <BadgeX className={`${className} fill-destructive`} />;
  }
  if (status === "PENDING" || status === "DRAFT") {
    return <Clock className="h-10 w-10 text-warning sm:h-14 sm:w-14" strokeWidth={1.75} />;
  }
  return <BadgeCheck className={`${className} fill-default-900`} />;
}

function addMinutes(time: string, minutes: number) {
  const [hours = 0, mins = 0] = time.split(":").map(Number);
  const total = (((hours * 60 + mins + Math.round(minutes)) % 1440) + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

type Props = {
  booking: Item;
  actions?: ReactNode;
  backHref?: string;
  heading?: { title: string; description: string };
  mapStickyClassName?: string;
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
  const title = `Booking Details - ${booking.bookingNumber}`;
  const pickupTime = booking.bookingTime?.pickupTime;
  const travelMinutes =
    booking.address?.travelDuration ?? (isHourly ? undefined : booking.address?.duration);
  const arrivalTime =
    !isHourly && pickupTime && travelMinutes != null ? addMinutes(pickupTime, travelMinutes) : null;
  const showMap = !isHourly && Boolean(booking.address?.dropoff?.address);

  return (
    <div className="space-y-4 md:space-y-5">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {props.backHref ? (
          <Button asChild size="sm" variant="outline" className="h-10 shrink-0 gap-1.5 px-3">
            <Link href={props.backHref}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
        ) : (
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
        )}

        <div className="flex h-10 min-w-0 flex-1 items-center justify-between gap-2 rounded-md border border-border bg-card px-3 sm:px-4">
          <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
            <CalendarCheck className="h-5 w-5 shrink-0 text-primary" />
            <h1 className="truncate text-sm font-semibold text-default-900 sm:text-base">
              <span className="sm:hidden">{booking.bookingNumber}</span>
              <span className="hidden sm:inline">{title}</span>
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

      <div className="max-sm:-mx-4 lg:overflow-hidden lg:rounded-md lg:border lg:border-border lg:bg-card">
        {showMap && booking.address?.dropoff ? (
          <AnimatedRouteMap
            pickupAddress={booking.address.pickup.address}
            deliveryAddress={booking.address.dropoff.address}
            stops={booking.address.stops}
            pickupTime={pickupTime}
            travelDuration={travelMinutes ?? undefined}
            bottomInset={40}
            wrapperClassName={cn(
              "max-lg:sticky max-lg:z-0 sm:max-lg:overflow-hidden sm:max-lg:rounded-md",
              props.mapStickyClassName ?? "max-lg:top-14",
            )}
            className="h-80 sm:h-96 lg:h-112 xl:rounded-none xl:border-0"
          />
        ) : null}

        <section
          className={cn(
            "relative z-10 bg-card px-4 pb-6 pt-6 sm:rounded-md sm:px-6 sm:pb-8 sm:pt-8 md:px-8 lg:rounded-none",
            showMap &&
              "max-lg:-mt-10 max-lg:rounded-t-2xl max-lg:pt-3 max-lg:shadow-lg sm:max-lg:pt-3",
          )}
        >
          {showMap ? (
            <div className="mb-5 flex justify-center lg:hidden">
              <div className="h-1.5 w-12 rounded-full bg-default-300" />
            </div>
          ) : null}
          <div className="grid w-full items-start gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1.45fr)] lg:gap-5">
            <div className="flex h-full w-full flex-col justify-between text-left">
              <div>
                <BookingStatusIcon status={booking.status} />
                <h2 className="mt-4 text-2xl font-bold text-default-900 sm:mt-6 sm:text-3xl">
                  {props.heading?.title ?? BOOKING_STATUS_HEADINGS[booking.status]}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-default-600 sm:mt-3 sm:text-base">
                  {props.heading?.description ?? BOOKING_STATUS_DESCRIPTIONS[booking.status]}
                </p>
                {booking.status === "CANCELLED" && booking.cancellationReason ? (
                  <p className="mt-2 text-sm text-destructive">
                    Reason: {booking.cancellationReason}
                  </p>
                ) : null}
              </div>

              <div className="mt-5 flex flex-col gap-4 sm:mt-6">
                <BookingCustomerDetails passenger={booking.passenger} />
                <BookingVehicleDetails
                  vehicleCategory={booking.vehicleCategory}
                  vehicleCount={booking.vehicleCount}
                />
                <BookingPaymentDetails payment={booking.payment} />
              </div>
            </div>

            <div className="flex h-full flex-col gap-4">
              <BookingLocationDetails
                pickupLocation={booking.address?.pickup?.address}
                dropoffLocation={booking.address?.dropoff?.address}
                stops={(booking.address?.stops ?? []).map((stop) => stop.address)}
                isHourly={isHourly}
                durationLabel={formatDuration({ minutes: booking.address?.duration })}
                pickupTime={pickupTime ? formatTime({ date: pickupTime }) : undefined}
                dropoffTime={arrivalTime ? formatTime({ date: arrivalTime }) : undefined}
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
                  {otherExtras.map((item) => (
                    <DetailItem key={`extra-${item.extraServiceId}`} icon={preferenceIcon(Tag)}>
                      {item.extraService?.name || "Extra"}: {item.quantity}
                    </DetailItem>
                  ))}
                  {flight?.flightName ? (
                    <DetailItem icon={preferenceIcon(Globe)}>
                      Airline: {flight.flightName}
                    </DetailItem>
                  ) : null}
                  {flight?.flightNumber ? (
                    <DetailItem icon={preferenceIcon(Globe)}>
                      Flight Number: {flight.flightNumber}
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

              {booking.status !== "CANCELLED" ? <BookingPaymentSummary booking={booking} /> : null}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
