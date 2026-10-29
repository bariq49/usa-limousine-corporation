import { TRIP_TYPES } from "../../constants/booking-constants";
import type {
  BookingStep1PersistedData,
  BookingStep3PersistedData,
  QuoteRequest,
  ReturnTrip,
} from "../../types/booking.types";

type Props = {
  step1: BookingStep1PersistedData | null;
  returnTrip: ReturnTrip | null;
  step3?: BookingStep3PersistedData | null;
  vehicleCategoryId?: string;
  vehicleCount?: number;
};

export const quoteRequest = (props: Props): QuoteRequest | null => {
  const { step1, returnTrip, step3, vehicleCategoryId, vehicleCount } = props;
  if (!step1) return null;

  const isHourly = step1.tripType === TRIP_TYPES.HOURLY;
  const deliveryAddress = step1.deliveryAddress.trim();
  if (!isHourly && !deliveryAddress) return null;
  if (isHourly && !step1.hourlyDuration) return null;

  const isReturn = !isHourly && Boolean(returnTrip);
  const seatCounts = new Map<string, { quantity: number; returnQuantity: number }>();
  (step3?.childSeats ?? []).forEach((seat) => {
    const counts = seatCounts.get(seat.id) ?? { quantity: 0, returnQuantity: 0 };
    counts.quantity += seat.quantity;
    seatCounts.set(seat.id, counts);
  });
  (isReturn ? (step3?.returnChildSeats ?? []) : []).forEach((seat) => {
    const counts = seatCounts.get(seat.id) ?? { quantity: 0, returnQuantity: 0 };
    counts.returnQuantity += seat.quantity;
    seatCounts.set(seat.id, counts);
  });
  const meetGreet = Boolean(step3?.meetGreetEnabled);
  const returnMeetGreet = isReturn && Boolean(step3?.returnMeetGreetEnabled);

  return {
    vehicleCategoryId,
    vehicleCount,
    bookingType: isHourly ? "HOURLY" : isReturn ? "RETURN" : "ONE_WAY",
    hourlyDuration: isHourly ? step1.hourlyDuration : undefined,
    address: {
      pickup: { address: step1.pickupAddress },
      dropoff: deliveryAddress ? { address: deliveryAddress } : undefined,
      stops: step1.stops,
      distance: Math.round((step1.distance ?? 0) * 100) / 100,
      travelDuration: step1.travelDuration ?? 0,
    },
    bookingTime: {
      pickupDate: step1.pickupDate,
      pickupTime: step1.pickupTime,
      returnDate: returnTrip?.returnDate,
      returnTime: returnTrip?.returnTime,
    },
    meetAndGreet:
      meetGreet || returnMeetGreet
        ? {
            enabled: meetGreet,
            returnEnabled: returnMeetGreet,
          }
        : undefined,
    extraServices: Array.from(seatCounts, ([extraServiceId, counts]) => ({
      extraServiceId,
      quantity: counts.quantity,
      returnQuantity: counts.returnQuantity,
    })),
    luggage: (step3?.luggage ?? []).map((item) => ({
      luggageTypeId: item.id,
      quantity: item.quantity,
    })),
    notifications: {
      email: step3?.notifyByEmail ?? true,
      sms: step3?.notifyBySms ?? false,
    },
  };
};
