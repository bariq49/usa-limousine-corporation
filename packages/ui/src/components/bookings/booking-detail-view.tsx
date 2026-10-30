"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentType, SVGProps } from "react";
import { ArrowLeft, BadgeCheck, BadgeX, Clock } from "lucide-react";
import { Badge } from "../badge";
import { Button } from "../button";
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
} from "../../svg";
import { BookingCustomerDetails } from "./booking-customer-details";
import { BookingLocationDetails } from "./booking-location-details";
import { BookingPaymentDetails } from "./booking-payment-details";
import { BookingPaymentSummary } from "./booking-payment-summary";
import { cn } from "../../utils/cn";
import { AnimatedRouteMap } from "./animated-route-map";
import { BookingVehicleDetails } from "./booking-vehicle-details";
import { DetailItem } from "./detail-item";
import { getLuggageIcon } from "./luggage-icon";
import { calculateArrivalTime, formatDate, formatTime } from "../../utils/date";
import { formatDistance } from "../../utils/distance";
import { formatDuration, formatHrs } from "../../utils/duration";
import type { Item } from "../../types/booking-model";
import type { BookingDetailViewProps } from "../../types/bookings";
import {
  BOOKING_STATUS_DESCRIPTIONS,
  BOOKING_STATUS_HEADINGS,
  BOOKING_STATUS_LABELS,
  BOOKING_TYPE_LABELS,
  bookingStatusBadgeColor,
} from "./labels";

type SvgIcon = ComponentType<SVGProps<SVGSVGElement>>;

function preferenceIcon(Icon: SvgIcon) {
  return <Icon className="block size-5 shrink-0" aria-hidden />;
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


export function BookingDetailView(props: BookingDetailViewProps) {
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
  const legacyReturnNotes = (booking.returnNotes ?? "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  const legacyReturnFlight = legacyReturnNotes
    .find((line) => line.toLowerCase().startsWith("return flight:"))
    ?.replace(/^return flight:\s*/i, "")
    .trim();
  const returnDriverNotes = legacyReturnNotes
    .filter(
      (line) =>
        !line.toLowerCase().startsWith("return flight:") &&
        !line.toLowerCase().startsWith("return meet & greet sign:"),
    )
    .join("\n\n");
  const returnFlightNumber = flight?.returnFlightNumber || legacyReturnFlight;
  const legacyReturnSign = legacyReturnNotes
    .find((line) => line.toLowerCase().startsWith("return meet & greet sign:"))
    ?.replace(/^return meet & greet sign:\s*/i, "")
    .trim();
  const returnSignName = meetAndGreet?.returnSignName || legacyReturnSign;
  const hasMeetAndGreet =
    Boolean(meetAndGreet?.enabled) ||
    Boolean(meetAndGreet?.returnEnabled) ||
    Boolean(meetAndGreet?.signName?.trim()) ||
    Boolean(returnSignName);
  const hasNotes = Boolean(booking.notes?.trim() || returnDriverNotes);
  const seatRows = childSeats.filter(
    (item) => item.quantity > 0 || Boolean(item.returnQuantity),
  );
  const title = `Booking Details - ${booking.bookingNumber}`;
  const pickupTime = booking.bookingTime?.pickupTime;
  const travelMinutes = isHourly ? undefined : booking.address?.travelDuration ?? undefined;
  const arrivalTime =
    !isHourly && pickupTime && travelMinutes != null
      ? calculateArrivalTime({ time: pickupTime, durationMinutes: travelMinutes })
      : null;
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
          <div className="flex w-full shrink-0 items-center gap-2 sm:w-auto">{props.actions}</div>
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
                durationLabel={
                  isHourly && booking.address?.hourlyDuration != null
                    ? formatHrs({ hours: booking.address.hourlyDuration })
                    : booking.address?.travelDuration != null
                      ? formatDuration({ minutes: booking.address.travelDuration })
                      : undefined
                }
                pickupTime={pickupTime ? formatTime({ date: pickupTime }) : undefined}
                dropoffTime={arrivalTime && arrivalTime !== "—" ? arrivalTime : undefined}
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
                  {isHourly && booking.address?.hourlyDuration != null ? (
                    <DetailItem icon={preferenceIcon(CalendarClock)}>
                      Hourly Duration: {formatHrs({ hours: booking.address.hourlyDuration })}
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
                      {item.returnQuantity ? ` · Return: ${item.returnQuantity}` : ""}
                    </DetailItem>
                  ))}
                  {flight?.flightNumber ? (
                    <DetailItem icon={preferenceIcon(Globe)}>
                      Flight Number: {flight.flightNumber}
                    </DetailItem>
                  ) : null}
                  {returnFlightNumber ? (
                    <DetailItem icon={preferenceIcon(Globe)}>
                      Return Flight Number: {returnFlightNumber}
                    </DetailItem>
                  ) : null}
                </div>
              </section>

              {seatRows.length ? (
                <section className="rounded-md bg-default-100 p-4">
                  <h3 className="font-bold text-default-900">Seats</h3>
                  <ul className="mt-3 space-y-3">
                    {seatRows.map((item) => {
                      if (item.quantity <= 0) return null;
                      const name = item.extraService?.name || "Child seat";
                      const description = item.extraService?.description?.trim();
                      return (
                        <li key={`seat-${item.extraServiceId}`} className="space-y-1">
                          <DetailItem icon={preferenceIcon(getSeatIcon(name))}>
                            {name}: {item.quantity}
                          </DetailItem>
                          {description ? (
                            <p className="pl-8 text-sm font-normal text-default-600">
                              {description}
                            </p>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                  {seatRows.some((item) => Boolean(item.returnQuantity)) ? (
                    <div className="mt-4 border-t border-default-200 pt-3">
                      <p className="mb-3 text-sm font-semibold text-default-800">Return seats</p>
                      <ul className="space-y-3">
                        {seatRows.map((item) => {
                          if (!item.returnQuantity) return null;
                          const name = item.extraService?.name || "Child seat";
                          const description = item.extraService?.description?.trim();
                          return (
                            <li key={`return-seat-${item.extraServiceId}`} className="space-y-1">
                              <DetailItem icon={preferenceIcon(getSeatIcon(name))}>
                                {name}: {item.returnQuantity}
                              </DetailItem>
                              {description ? (
                                <p className="pl-8 text-sm font-normal text-default-600">
                                  {description}
                                </p>
                              ) : null}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ) : null}
                </section>
              ) : null}
            </div>

            <div className="flex flex-col gap-4 lg:col-span-2">
              {props.children}
              {hasMeetAndGreet ? (
                <section className="rounded-md bg-default-100 p-4">
                  <h3 className="font-bold text-default-900">Meet & Greet</h3>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {meetAndGreet?.enabled ? (
                      <DetailItem icon={preferenceIcon(UserSign)}>
                        Meet & Greet
                        {meetAndGreet.signName ? `: ${meetAndGreet.signName}` : ""}
                      </DetailItem>
                    ) : null}
                    {meetAndGreet?.returnEnabled ? (
                      <DetailItem icon={preferenceIcon(UserSign)}>
                        Return Meet & Greet
                        {returnSignName ? `: ${returnSignName}` : ""}
                      </DetailItem>
                    ) : null}
                  </div>
                </section>
              ) : null}

              {hasNotes ? (
                <section className="rounded-md bg-default-100 p-4">
                  <h3 className="font-bold text-default-900">Notes & Special Instructions</h3>
                  {booking.notes?.trim() ? (
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-default-700">
                      {booking.notes}
                    </p>
                  ) : null}
                  {returnDriverNotes ? (
                    <div className={booking.notes?.trim() ? "mt-4" : "mt-2"}>
                      {booking.notes?.trim() ? (
                        <p className="mb-1 text-sm font-semibold text-default-800">Return notes</p>
                      ) : null}
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-default-700">
                        {returnDriverNotes}
                      </p>
                    </div>
                  ) : null}
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
