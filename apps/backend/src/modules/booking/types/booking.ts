import type { BookingStatus, BookingType } from "@prisma/client";

export type LocationInput = {
  address: string;
  latitude?: number | null;
  longitude?: number | null;
};

export type AddressInput = {
  pickup: LocationInput;
  dropoff?: LocationInput | null;
  stops?: LocationInput[];
  distance: number;
  duration: number;
};

export type PassengerInput = {
  passengerCount: number;
  name: string;
  phone: string;
  email: string;
  specialInstructions?: string | null;
  flightNumber?: string | null;
  trainNumber?: string | null;
};

export type TimeInput = {
  pickupDate: string;
  pickupTime: string;
  returnDate?: string | null;
  returnTime?: string | null;
};

export type PricingInput = {
  total: number;
};

export type FlightDetailsInput = {
  flightName?: string | undefined;
  flightNumber?: string | undefined;
};

export type MeetAndGreetInput = {
  enabled?: boolean | undefined;
  instructions?: string | undefined;
  signName?: string | undefined;
};

export type ExtraServiceItemInput = {
  extraServiceId: string;
  quantity: number;
  price?: number | undefined;
};

export type LuggageItemInput = {
  luggageTypeId: string;
  quantity: number;
};

export type CreateData = {
  userId?: string | null | undefined;
  vehicleCategoryId: string;
  bookingNumber: string;
  bookingType: BookingType;
  status: BookingStatus;
  confirmedAt?: Date | undefined;
  pricing: PricingInput;
  address: AddressInput;
  passenger: PassengerInput;
  bookingTime: TimeInput;
  flightDetails?: FlightDetailsInput | undefined;
  meetAndGreet?: MeetAndGreetInput | undefined;
  extraServices?: ExtraServiceItemInput[] | undefined;
  driverNotes?: string | null | undefined;
  luggage: LuggageItemInput[];
};

export type UpdateData = {
  vehicleCategoryId?: string | undefined;
  bookingType?: BookingType | undefined;
  pricing?: PricingInput | undefined;
  address?: AddressInput | undefined;
  passenger?: PassengerInput | undefined;
  bookingTime?: TimeInput | undefined;
  flightDetails?: FlightDetailsInput | undefined;
  meetAndGreet?: MeetAndGreetInput | undefined;
  extraServices?: ExtraServiceItemInput[] | undefined;
  driverNotes?: string | null | undefined;
  luggage?: LuggageItemInput[] | undefined;
};

export type UpdateStatusData = {
  confirmedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
};

export type StatusUpdate = {
  status: BookingStatus;
  confirmedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
};
