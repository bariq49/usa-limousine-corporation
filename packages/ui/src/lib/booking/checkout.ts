import { BOOKING_API_ROUTES, TRIP_TYPES } from "../../constants/booking";
import type {
  Booking,
  BookingDraft,
  ChildSeat,
  DraftBookingInput,
  DraftExtraService,
  DraftLuggage,
  CheckoutStart,
} from "../../types/booking";
import { isAirport } from "../../utils/location";
import { bookingApi } from "./client";

export const startCheckout = async (draft: BookingDraft): Promise<CheckoutStart> => {
  const response = await bookingApi.post(BOOKING_API_ROUTES.CHECKOUT, draft);
  return response.data;
};

export const getBooking = async (id: string): Promise<Booking> => {
  const response = await bookingApi.get(
    `${BOOKING_API_ROUTES.CHECKOUT}/${encodeURIComponent(id)}`,
  );
  return response.data;
};

function draftExtraServices(
  outbound: ChildSeat[],
  inbound: ChildSeat[],
  isReturn: boolean,
): DraftExtraService[] {
  const byId = new Map<string, DraftExtraService>();

  for (const seat of outbound) {
    if (seat.quantity <= 0) continue;
    byId.set(seat.id, {
      extraServiceId: seat.id,
      quantity: seat.quantity,
      returnQuantity: 0,
    });
  }

  if (!isReturn) return Array.from(byId.values());

  for (const seat of inbound) {
    if (seat.quantity <= 0) continue;
    const existing = byId.get(seat.id);
    if (existing) {
      existing.returnQuantity = seat.quantity;
      continue;
    }
    byId.set(seat.id, {
      extraServiceId: seat.id,
      quantity: 0,
      returnQuantity: seat.quantity,
    });
  }

  return Array.from(byId.values());
}

function draftLuggage(items: { id: string; quantity: number }[]): DraftLuggage[] {
  return items
    .filter((item) => item.quantity > 0)
    .map((item) => ({
      luggageTypeId: item.id,
      quantity: item.quantity,
    }));
}

export function draftBooking(input: DraftBookingInput): BookingDraft {
  const { step1, step2, step3, returnTrip } = input;
  const isHourly = step1.tripType === TRIP_TYPES.HOURLY;
  const isReturn = !isHourly && Boolean(returnTrip);
  const deliveryAddress = step1.deliveryAddress.trim();
  const airport = isAirport({
    pickupAddress: step1.pickupAddress,
    deliveryAddress: step1.deliveryAddress,
  });

  return {
    vehicleCategoryId: step2.vehicleCategory.id,
    vehicleCount: step2.vehicleCount,
    bookingType: isHourly ? "HOURLY" : isReturn ? "RETURN" : "ONE_WAY",
    hourlyDuration: isHourly ? step1.hourlyDuration : undefined,
    address: {
      pickup: { address: step1.pickupAddress },
      dropoff: deliveryAddress ? { address: deliveryAddress } : undefined,
      stops: step1.stops,
      distance: step2.distance,
      travelDuration: step2.travelDuration,
    },
    passenger: {
      passengerCount: step2.passengers,
      name: `${step3.title} ${step3.fullName.trim()}`,
      phone: step3.phone ? `+${step3.phone.replace(/\D/g, "")}` : "",
      email: step3.email.trim(),
      ccEmail: step3.ccEmail,
    },
    bookingTime: {
      pickupDate: step1.pickupDate,
      pickupTime: step1.pickupTime,
      returnDate: returnTrip?.returnDate,
      returnTime: returnTrip?.returnTime,
    },
    flightDetails:
      airport || (isReturn && step3.returnFlightNumber)
        ? {
            flightNumber: airport ? step3.flightNumber : undefined,
            returnFlightNumber: isReturn ? step3.returnFlightNumber : undefined,
          }
        : undefined,
    meetAndGreet:
      step3.meetGreetEnabled || (isReturn && step3.returnMeetGreetEnabled)
        ? {
            enabled: Boolean(step3.meetGreetEnabled),
            signName: step3.meetGreet,
            returnEnabled: isReturn && Boolean(step3.returnMeetGreetEnabled),
            returnSignName: isReturn ? step3.returnMeetGreet : undefined,
          }
        : undefined,
    extraServices: draftExtraServices(
      step3.childSeats ?? [],
      step3.returnChildSeats ?? [],
      isReturn,
    ),
    luggage: draftLuggage(step3.luggage ?? []),
    notifications: {
      email: step3.notifyByEmail ?? true,
      sms: step3.notifyBySms ?? false,
    },
    notes: step3.notes || undefined,
    returnNotes: step3.returnNotes || undefined,
  };
}
