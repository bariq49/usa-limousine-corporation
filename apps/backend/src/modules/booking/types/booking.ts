import type { BookingPricing } from "../../platform-settings/types/platform-settings";
import type { BookingStatus, BookingType, Prisma } from "@prisma/client";

export const bookingPaymentSelect = {
  select: {
    status: true,
    transactionId: true,
    amount: true,
    currency: true,
    cardBrand: true,
    cardLast4: true,
    paidAt: true,
    refundedAmount: true,
    refundedAt: true,
  },
} as const;

export const bookingItemsInclude = {
  luggage: {
    include: { luggageType: { select: { id: true, name: true } } },
  },
  extraServices: {
    include: {
      extraService: { select: { id: true, name: true, description: true, type: true } },
    },
  },
} as const;

export type FindForCalendarParams = {
  start: string;
  end: string;
  bookingTypes?: BookingType[] | undefined;
  statuses: BookingStatus[];
  userId?: string | undefined;
};

export type CalendarRow = {
  id: string;
  bookingNumber: string;
  bookingType: BookingType;
  status: BookingStatus;
  address: unknown;
  passenger: unknown;
  bookingTime: unknown;
  vehicleCategory: { name: string };
};

export type SmsBooking = {
  bookingNumber: string;
  pickup: string;
  total: string;
};

export type LocationInput = {
  address: string;
  latitude?: number | null | undefined;
  longitude?: number | null | undefined;
};

export type AddressInput = {
  pickup: LocationInput;
  dropoff?: LocationInput | null | undefined;
  stops?: LocationInput[] | undefined;
  distance: number;
  travelDuration: number;
  hourlyDuration?: number | null | undefined;
};

export type PassengerInput = {
  passengerCount: number;
  name: string;
  phone: string;
  email: string;
  ccEmail?: string | null | undefined;
};

export type TimeInput = {
  pickupDate: string;
  pickupTime: string;
  returnDate?: string | null | undefined;
  returnTime?: string | null | undefined;
};

export type PricingInput = {
  total: number;
};

export type FlightDetailsInput = {
  flightNumber?: string | undefined;
  returnFlightNumber?: string | undefined;
};

export type MeetAndGreetInput = {
  enabled?: boolean | undefined;
  returnEnabled?: boolean | undefined;
  signName?: string | undefined;
  returnSignName?: string | undefined;
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
  month: number | null;
  range: string | null;
  labels: string[];
  totalBookings: number;
  totalRevenue: number;
  completedAmount: number;
  confirmedAmount: number;
  pendingAmount: number;
  cancelledAmount: number;
  completedBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  monthlyRevenue: number[];
  monthlyBookings: MonthlySeries;
  amountSeries: MonthlySeries;
};

export type AnalyticsEventRow = {
  createdAt: Date;
  status: BookingStatus;
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

export type VehicleEstimate = {
  vehicleCategory: {
    id: string;
    name: string;
    models: string | null;
    description: string | null;
    image: string | null;
    passengerCount: number;
    luggageCount: number;
  };
  vehicleCount: number;
  pricing: BookingPricing;
  total: number;
  distance: number;
  travelDuration: number;
};
