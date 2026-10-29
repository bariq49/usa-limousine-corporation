import { createHash } from "node:crypto";
import { BookingType } from "@prisma/client";
import type { TripPriceDto } from "../dto/booking.dto";

export function quoteInput(body: TripPriceDto) {
  const bookingType = body.bookingType ?? BookingType.ONE_WAY;
  const isReturn = bookingType === BookingType.RETURN;
  const isHourly = bookingType === BookingType.HOURLY;

  return {
    bookingType,
    vehicleCount: body.vehicleCount ?? 1,
    hourlyDuration: isHourly ? (body.hourlyDuration ?? null) : null,
    pickup: body.address.pickup.address.trim(),
    dropoff: body.address.dropoff?.address.trim() ?? null,
    stops: (body.address.stops ?? []).map((stop) => stop.address.trim()),
    distance: body.address.distance,
    travelDuration: body.address.travelDuration ?? null,
    pickupDate: body.bookingTime.pickupDate,
    pickupTime: body.bookingTime.pickupTime,
    returnDate: isReturn ? (body.bookingTime.returnDate ?? null) : null,
    returnTime: isReturn ? (body.bookingTime.returnTime ?? null) : null,
    meetAndGreet: Boolean(body.meetAndGreet?.enabled),
    returnMeetAndGreet: isReturn && Boolean(body.meetAndGreet?.returnEnabled),
    extraServices: (body.extraServices ?? [])
      .map((item) => ({
        id: item.extraServiceId,
        quantity: item.quantity,
        returnQuantity: isReturn ? (item.returnQuantity ?? 0) : 0,
      }))
      .filter((item) => item.quantity + item.returnQuantity > 0)
      .sort((a, b) => a.id.localeCompare(b.id)),
    notifications: body.notifications
      ? { email: body.notifications.email, sms: body.notifications.sms }
      : null,
    luggage: (body.luggage ?? [])
      .map((item) => ({ id: item.luggageTypeId, quantity: item.quantity }))
      .filter((item) => item.quantity > 0)
      .sort((a, b) => a.id.localeCompare(b.id)),
  };
}

export function quoteHash(input: ReturnType<typeof quoteInput>): string {
  return createHash("sha256").update(JSON.stringify(input)).digest("hex");
}
