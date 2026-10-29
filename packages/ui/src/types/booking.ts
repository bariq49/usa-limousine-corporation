import type { Item, Pricing as BookingPricing } from "./booking-model";

export type Booking = Item;

export type Settings = {
  fuelSurchargeRate?: number;
  gratuityRate?: number;
  taxRate?: number;
  transactionFeeRate?: number;
  oneWayDiscountRate?: number;
  returnDiscountRate?: number;
  airportPickupFee?: number;
  stopFee?: number;
  meetAndGreetFee?: number;
  minBookingMinutes?: number;
  cancellationMinutes?: number;
  cancellationRefundRate?: number;
  emailNotificationFee?: number;
  smsNotificationFee?: number;
};

export type TripType = "one-way" | "return" | "hourly";

export type VehicleCategory = {
  id: string;
  name: string;
  description?: string | null;
  image?: string | null;
  passengerCount: number;
  luggageCount: number;
};

export type Pricing = BookingPricing;

export type Return = {
  returnDate: string;
  returnTime: string;
};

export type Estimate = {
  vehicleCategory: VehicleCategory;
  vehicleCount: number;
  pricing: Pricing;
  total: number;
  distance: number;
  travelDuration: number;
};

export type Step1 = {
  tripType: TripType;
  pickupAddress: string;
  deliveryAddress: string;
  stops: { address: string }[];
  pickupDate: string;
  pickupTime: string;
  hourlyDuration?: number | undefined;
};

export type Step2 = {
  vehicleCategory: VehicleCategory;
  vehicleCount: number;
  passengers: number;
  bags: number;
  pricing: Pricing | null;
  total: number;
  distance: number;
  travelDuration: number;
};

export type CountsChange = {
  vehicleCategory: VehicleCategory;
  vehicleCount: number;
  passengers: number;
  bags: number;
};

export type ChildSeat = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

export type LuggageItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

export type Step3 = {
  title: string;
  fullName: string;
  phone: string;
  email: string;
  ccEmail?: string | undefined;
  notes?: string | undefined;
  returnNotes?: string | undefined;
  notifyByEmail?: boolean | undefined;
  notifyBySms?: boolean | undefined;
  flightNumber?: string | undefined;
  meetGreetEnabled?: boolean | undefined;
  meetGreet?: string | undefined;
  luggage?: LuggageItem[] | undefined;
  childSeats?: ChildSeat[] | undefined;
  returnFlightNumber?: string | undefined;
  returnMeetGreetEnabled?: boolean | undefined;
  returnMeetGreet?: string | undefined;
  returnChildSeats?: ChildSeat[] | undefined;
};

export type Step1FormValues = {
  tripType: TripType;
  pickupAddress: string;
  deliveryAddress: string;
  stops: { address: string }[];
  pickupDate: string;
  pickupTime: string;
  hourlyDuration?: number | undefined;
};

export type HeroFormValues = Step1FormValues;

export type Step3FormValues = {
  title: string;
  fullName: string;
  phone: string;
  email: string;
  ccEmailEnabled: boolean;
  ccEmail: string;
  flightNumber: string;
  notes: string;
  returnNotes: string;
  notifyByEmail: boolean;
  notifyBySms: boolean;
  luggage: LuggageItem[];
  meetGreetEnabled: boolean;
  meetGreet: string;
  childSeatsEnabled: boolean;
  childSeats: ChildSeat[];
  returnFlightNumber: string;
  returnMeetGreetEnabled: boolean;
  returnMeetGreet: string;
  returnChildSeatsEnabled: boolean;
  returnChildSeats: ChildSeat[];
};

export type BookingType = "ONE_WAY" | "RETURN" | "HOURLY";

export type DraftMeetAndGreet = {
  enabled: boolean;
  signName?: string | undefined;
  returnEnabled?: boolean | undefined;
  returnSignName?: string | undefined;
};

export type DraftExtraService = {
  extraServiceId: string;
  quantity: number;
  returnQuantity: number;
};

export type DraftLuggage = {
  luggageTypeId: string;
  quantity: number;
};

export type DraftNotifications = {
  email: boolean;
  sms: boolean;
};

export type BookingDraft = {
  vehicleCategoryId: string;
  vehicleCount: number;
  bookingType: BookingType;
  hourlyDuration?: number | undefined;
  address: {
    pickup: { address: string };
    dropoff?: { address: string } | undefined;
    stops?: { address: string }[] | undefined;
    distance: number;
    travelDuration: number;
  };
  passenger: {
    passengerCount: number;
    name: string;
    phone: string;
    email: string;
    ccEmail?: string | undefined;
  };
  bookingTime: {
    pickupDate: string;
    pickupTime: string;
    returnDate?: string | undefined;
    returnTime?: string | undefined;
  };
  flightDetails?:
    | { flightNumber?: string | undefined; returnFlightNumber?: string | undefined }
    | undefined;
  meetAndGreet?: DraftMeetAndGreet | undefined;
  extraServices?: DraftExtraService[] | undefined;
  luggage?: DraftLuggage[] | undefined;
  notes?: string | undefined;
  returnNotes?: string | undefined;
  notifications?: DraftNotifications | undefined;
};

export type EstimateRequest = {
  vehicleCategoryId?: string | undefined;
  vehicleCount?: number | undefined;
  bookingType: BookingType;
  hourlyDuration?: number | undefined;
  address: BookingDraft["address"];
  bookingTime: BookingDraft["bookingTime"];
  meetAndGreet?: BookingDraft["meetAndGreet"];
  extraServices?: BookingDraft["extraServices"];
  luggage?: BookingDraft["luggage"];
  notifications?: BookingDraft["notifications"];
};

export type DraftBookingInput = {
  step1: Step1;
  step2: Step2;
  step3: Step3;
  returnTrip: Return | null;
};

export type CheckoutStart = {
  url: string;
  orderId: string;
  bookingNumber: string;
};

export type Checkout = {
  orderId: string;
  url: string;
};

export type ExtraServiceType = "CHILD_SEAT" | "EXTRA";

export type ExtraService = {
  id: string;
  name: string;
  description?: string | null;
  image?: string | null;
  price: number;
  type: ExtraServiceType;
  maxQuantity: number;
};

export type LuggageType = {
  id: string;
  name: string;
  description?: string | null;
  dimensions?: string | null;
  image?: string | null;
  price?: number | null;
  maxQuantity: number;
};
