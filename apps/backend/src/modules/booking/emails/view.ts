import type { BookingRepository } from "../repositories/booking.repository";
import type {
  AddressInput,
  FlightDetailsInput,
  MeetAndGreetInput,
  PassengerInput,
  TimeInput,
} from "../types/booking";
import type { BookingEmail } from "./types";

type BookingRow = NonNullable<Awaited<ReturnType<BookingRepository["findById"]>>>;

export function toBookingEmail(row: BookingRow): BookingEmail {
  const address = row.address as AddressInput;
  const passenger = row.passenger as PassengerInput;
  const time = row.bookingTime as TimeInput;
  const flight = (row.flightDetails ?? {}) as FlightDetailsInput;
  const meetAndGreet = (row.meetAndGreet ?? {}) as MeetAndGreetInput;

  return {
    id: row.id,
    bookingNumber: row.bookingNumber,
    bookingType: row.bookingType,
    vehicleCount: row.vehicleCount,
    vehicle: {
      name: row.vehicleCategory.name,
      description: row.vehicleCategory.description,
      image: row.vehicleCategory.image,
      passengerCount: row.vehicleCategory.passengerCount,
    },
    pickupAddress: address.pickup.address,
    dropoffAddress: address.dropoff?.address ?? null,
    stops: (address.stops ?? []).map((stop) => stop.address),
    distance: address.distance,
    duration: address.duration,
    pickupDate: time.pickupDate,
    pickupTime: time.pickupTime,
    returnDate: time.returnDate ?? null,
    returnTime: time.returnTime ?? null,
    passenger: {
      name: passenger.name,
      email: passenger.email,
      phone: passenger.phone,
      ccEmail: passenger.ccEmail ?? null,
      passengerCount: passenger.passengerCount,
    },
    flight: { airline: flight.flightName ?? null, number: flight.flightNumber ?? null },
    meetAndGreet: {
      enabled: Boolean(meetAndGreet.enabled),
      returnEnabled: Boolean(meetAndGreet.returnEnabled),
      signName: meetAndGreet.signName ?? null,
    },
    luggage: row.luggage.map((item) => ({ name: item.luggageType.name, quantity: item.quantity })),
    extras: row.extraServices.map((item) => ({
      name: item.extraService.name,
      quantity: item.quantity,
      returnQuantity: item.returnQuantity,
      unitPrice: item.unitPrice.toNumber(),
    })),
    notes: row.notes,
    pricing: row.pricing as BookingEmail["pricing"],
  };
}
