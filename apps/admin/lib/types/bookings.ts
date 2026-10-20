export type BookingStatus = "DRAFT" | "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

export type BookingType = "ONE_WAY" | "RETURN" | "HOURLY" | "CREW_RIDE";

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
};

export type Passenger = {
  name: string;
  email?: string | undefined;
  phone?: string | undefined;
  passengerCount?: number | undefined;
  specialInstructions?: string | undefined;
  flightNumber?: string | undefined;
  trainNumber?: string | undefined;
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
  stopsPrice?: number | undefined;
  airportPickupPrice?: number | undefined;
  extraServicesPrice?: number | undefined;
  subtotal?: number | undefined;
  currency?: string | undefined;
};

export type FlightDetails = {
  flightName?: string | undefined;
  flightNumber?: string | undefined;
};

export type MeetAndGreet = {
  enabled?: boolean | undefined;
  instructions?: string | undefined;
  signName?: string | undefined;
};

export type ExtraServiceItem = {
  extraServiceId: string;
  quantity: number;
  price?: number | undefined;
  name?: string | undefined;
};

export type BookingLuggageItem = {
  id: string;
  quantity: number;
  luggageType?: {
    id: string;
    name: string;
    isSpecial?: boolean | undefined;
    price?: number | string | null | undefined;
  } | null;
};

export type Item = {
  id: string;
  userId?: string | null | undefined;
  vehicleCategoryId: string;
  bookingNumber: string;
  status: BookingStatus;
  bookingType: BookingType;
  pricing: Pricing;
  address: Address;
  passenger: Passenger;
  bookingTime: BookingTime;
  flightDetails?: FlightDetails | null | undefined;
  meetAndGreet?: MeetAndGreet | null | undefined;
  extraServices?: ExtraServiceItem[] | null | undefined;
  driverNotes?: string | null | undefined;
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
