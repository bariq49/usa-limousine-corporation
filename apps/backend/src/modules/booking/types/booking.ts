import type {
  BookingPricing,
  BookingPricingInput,
} from "../../platform-settings/types/platform-settings";
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

export type PricedItems = {
  extraServices: {
    extraServiceId: string;
    quantity: number;
    returnQuantity: number;
    unitPrice: Prisma.Decimal;
    name: string;
  }[];
  luggage: { luggageTypeId: string; quantity: number; unitPrice: Prisma.Decimal; name: string }[];
};

export type CreateData = {
  userId?: string | null | undefined;
  vehicleCategoryId: string;
  bookingNumber: string;
  bookingType: BookingType;
  vehicleCount?: number | undefined;
  status: BookingStatus;
  confirmedAt?: Date | undefined;
  pricing: PricingInput | BookingPricing;
  address: AddressInput;
  passenger: PassengerInput;
  bookingTime: TimeInput;
  flightDetails?: FlightDetailsInput | undefined;
  meetAndGreet?: MeetAndGreetInput | undefined;
  extraServices?: ExtraServiceItemInput[] | undefined;
  notes?: string | null | undefined;
  returnNotes?: string | null | undefined;
  luggage: LuggageItemInput[];
  quoteId?: string | undefined;
  notifyByEmail?: boolean | undefined;
  notifyBySms?: boolean | undefined;
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
  returnNotes?: string | null | undefined;
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

export type Analytics = {
  year: number;
  totalBookings: number;
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

export type TripPricing = Omit<BookingPricingInput, "basePrice" | "vehicleCount">;

export type QuoteEstimate = {
  vehicleCategory: {
    id: string;
    name: string;
    description: string | null;
    image: string | null;
    passengerCount: number;
    luggageCount: number;
  };
  vehicleCount: number;
  pricing: BookingPricing;
  total: number;
};

export type SavedQuote = QuoteEstimate & { id: string; expiresAt: Date };
