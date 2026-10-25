export type BookingStatus = "DRAFT" | "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

export type BookingType = "ONE_WAY" | "RETURN" | "HOURLY";

export type Location = {
  address: string;
  latitude?: number | undefined;
  longitude?: number | undefined;
};

export type Address = {
  pickup: Location;
  dropoff?: Location | undefined;
  stops?: Location[] | undefined;
  distance?: number | undefined;
  duration?: number | undefined;
  travelDuration?: number | null | undefined;
};

export type Passenger = {
  name: string;
  email?: string | undefined;
  ccEmail?: string | undefined;
  phone?: string | undefined;
  passengerCount?: number | undefined;
};

export type BookingTime = {
  pickupDate: string;
  pickupTime: string;
  returnDate?: string | undefined;
  returnTime?: string | undefined;
};

export type Pricing = {
  total: number;
  basePrice?: number | undefined;
  /** Platform fees charged at booking time (customer bookings priced by the server). */
  fuelSurchargePrice?: number | undefined;
  gratuityPrice?: number | undefined;
  taxPrice?: number | undefined;
  transactionFeePrice?: number | undefined;
  discountPrice?: number | undefined;
  meetAndGreetPrice?: number | undefined;
  stopsPrice?: number | undefined;
  airportPickupPrice?: number | undefined;
  extraServicesPrice?: number | undefined;
  subtotal?: number | undefined;
  currency?: string | undefined;
  /** Outbound and return leg amounts on return trips. */
  legs?: { oneWay: LegPricing; returnTrip: LegPricing } | undefined;
  rates?: PricingRates | undefined;
};

export type LegPricing = {
  basePrice: number;
  fuelSurchargePrice: number;
  gratuityPrice: number;
  taxPrice: number;
  transactionFeePrice: number;
  discountPrice: number;
  airportPickupPrice: number;
  meetAndGreetPrice?: number | undefined;
  total: number;
};

export type PricingRates = {
  fuelSurchargeRate: number;
  gratuityRate: number;
  taxRate: number;
  transactionFeeRate: number;
  oneWayDiscountRate: number;
  returnDiscountRate: number;
};

export type FlightDetails = {
  flightName?: string | undefined;
  flightNumber?: string | undefined;
};

export type MeetAndGreet = {
  enabled?: boolean | undefined;
  returnEnabled?: boolean | undefined;
  signName?: string | undefined;
};

/** Extra service on a booking; `unitPrice` is the price charged at booking time. */
export type ExtraServiceItem = {
  id: string;
  extraServiceId: string;
  quantity: number;
  returnQuantity?: number | undefined;
  unitPrice: number;
  extraService?: { id: string; name: string; type: string } | null;
};

/** Luggage on a booking; `unitPrice` is the price charged at booking time. */
export type BookingLuggageItem = {
  id: string;
  quantity: number;
  unitPrice: number;
  luggageType?: { id: string; name: string } | null;
};

export type Payment = {
  status: "PAID" | "REFUNDED" | "CANCELLED";
  transactionId?: string | null | undefined;
  amount: number | string;
  currency?: string | undefined;
  cardBrand?: string | null | undefined;
  cardLast4?: string | null | undefined;
  paidAt?: string | null | undefined;
  refundedAmount?: number | string | null | undefined;
  refundedAt?: string | null | undefined;
};

export type Item = {
  id: string;
  userId?: string | null | undefined;
  vehicleCategoryId: string;
  bookingNumber: string;
  status: BookingStatus;
  bookingType: BookingType;
  vehicleCount?: number | undefined;
  totalPrice: number;
  pricing: Pricing;
  address: Address;
  passenger: Passenger;
  bookingTime: BookingTime;
  flightDetails?: FlightDetails | null | undefined;
  meetAndGreet?: MeetAndGreet | null | undefined;
  extraServices?: ExtraServiceItem[] | null | undefined;
  payment?: Payment | null | undefined;
  notes?: string | null | undefined;
  confirmedAt?: string | null | undefined;
  completedAt?: string | null | undefined;
  cancelledAt?: string | null | undefined;
  cancellationReason?: string | null | undefined;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null | undefined;
  vehicleCategory?:
    | {
        id: string;
        name: string;
        description?: string | null | undefined;
        image?: string | null | undefined;
        passengerCount: number;
      }
    | undefined;
  luggage?: BookingLuggageItem[] | undefined;
  user?:
    | {
        id: string;
        email?: string | null | undefined;
        firstName?: string | null | undefined;
        lastName?: string | null | undefined;
        phone?: string | null | undefined;
      }
    | null
    | undefined;
};

export type Query = {
  /** Admin only: one customer's bookings. */
  userId?: string | undefined;
  page?: number | undefined;
  limit?: number | undefined;
  search?: string | undefined;
  status?: BookingStatus | undefined;
  bookingType?: BookingType | undefined;
  sortBy?: string | undefined;
  sortOrder?: "asc" | "desc" | undefined;
};

export type ListResponse = {
  data: Item[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

/** Body for creating a booking (customer `POST /customers/bookings`). */
export type CreateInput = {
  vehicleCategoryId: string;
  vehicleCount?: number | undefined;
  bookingType?: BookingType | undefined;
  address: Address & { distance: number; duration: number };
  passenger: Passenger & { passengerCount: number; phone: string; email: string };
  bookingTime: BookingTime;
  flightDetails?: FlightDetails | undefined;
  meetAndGreet?: MeetAndGreet | undefined;
  extraServices?: { extraServiceId: string; quantity: number }[] | undefined;
  luggage?: { luggageTypeId: string; quantity: number }[] | undefined;
  notes?: string | undefined;
  pricing: Pricing;
};

/** One booking on the calendar, placed on its pickup date (`GET .../bookings/calendar`). */
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

/** Calendar request: inclusive YYYY-MM-DD range plus optional filters. */
export type CalendarQuery = {
  start: string;
  end: string;
  bookingType?: BookingType[] | undefined;
};
