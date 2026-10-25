import type { BookingPricing } from "../../platform-settings/types/platform-settings";
import type { BookingStatus, BookingType, Prisma } from "@prisma/client";

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
  travelDuration?: number | null;
};

export type PassengerInput = {
  passengerCount: number;
  name: string;
  phone: string;
  email: string;
  ccEmail?: string | null;
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
  returnEnabled?: boolean | undefined;
  signName?: string | undefined;
};

export type ExtraServiceItemInput = {
  extraServiceId: string;
  quantity: number;
  returnQuantity?: number | undefined;
};

export type LuggageItemInput = {
  luggageTypeId: string;
  quantity: number;
};

/** Items with the catalog unit price captured at booking time. */
export type PricedItems = {
  extraServices: {
    extraServiceId: string;
    quantity: number;
    returnQuantity: number;
    unitPrice: Prisma.Decimal;
  }[];
  luggage: { luggageTypeId: string; quantity: number; unitPrice: Prisma.Decimal }[];
};

export type CreateData = {
  userId?: string | null | undefined;
  vehicleCategoryId: string;
  bookingNumber: string;
  bookingType: BookingType;
  vehicleCount?: number | undefined;
  status: BookingStatus;
  confirmedAt?: Date | undefined;
  /** Admin bookings keep the entered pricing; customer bookings store the server-built breakdown. */
  pricing: PricingInput | BookingPricing;
  address: AddressInput;
  passenger: PassengerInput;
  bookingTime: TimeInput;
  flightDetails?: FlightDetailsInput | undefined;
  meetAndGreet?: MeetAndGreetInput | undefined;
  extraServices?: ExtraServiceItemInput[] | undefined;
  notes?: string | null | undefined;
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
  notes?: string | null | undefined;
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

export type MonthlySeries = {
  completed: number[];
  confirmed: number[];
  pending: number[];
  cancelled: number[];
};

/** Booking totals for one year plus 12 monthly buckets (Jan..Dec), by booking creation month. */
export type Analytics = {
  year: number;
  totalBookings: number;
  /** Sum of `pricing.total` over completed bookings. */
  totalRevenue: number;
  completedBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  monthlyRevenue: number[];
  monthlyBookings: MonthlySeries;
};

export type AnalyticsRow = {
  month: number;
  status: BookingStatus;
  count: number;
  amount: number;
};

/** One booking on the calendar, placed on its pickup date. */
export type CalendarEvent = {
  id: string;
  bookingNumber: string;
  bookingType: BookingType;
  status: BookingStatus;
  pickupDate: string;
  pickupTime: string;
  returnDate: string | null;
  returnTime: string | null;
  customerName: string;
  vehicleName: string;
  pickupAddress: string;
  dropoffAddress: string | null;
};
