import type { VehicleCategory } from './vehicle-category.types';
import type { BookingSettings } from './settings.types';
import type { Pricing as BookingPricing } from '@usa-limousine-corporation/ui/bookings/types';

export type { BookingSettings };

export type TripType = "one-way" | "return" | "hourly";

export type { VehicleCategory };

export type Pricing = BookingPricing;

export interface ReturnTrip {
    returnDate: string;
    returnTime: string;
}

export interface QuoteEstimate {
    vehicleCategory: VehicleCategory;
    vehicleCount: number;
    pricing: Pricing;
    total: number;
}

export interface Quote extends QuoteEstimate {
    id: string;
    expiresAt: string;
}

export interface BookingStep1PersistedData {
    tripType: TripType;
    pickupAddress: string;
    deliveryAddress: string;
    stops: { address: string }[];
    pickupDate: string;
    pickupTime: string;
    distance?: number;
    travelDuration?: number;
    hourlyDuration?: number;
    isAirportSelected?: boolean;
}

export interface BookingStep2PersistedData {
    vehicleCategory: VehicleCategory;
    vehicleCount: number;
    passengers: number;
    bags: number;
}

export type Step3ChildSeatSelection = {
    id: string;
    name: string;
    price: number;
    quantity: number;
};

export type Step3LuggageSelection = {
    id: string;
    name: string;
    price: number;
    quantity: number;
};

export interface BookingStep3PersistedData {
    title: string;
    fullName: string;
    phone: string;
    email: string;
    ccEmail?: string;
    notes?: string;
    returnNotes?: string;
    notifyByEmail?: boolean;
    notifyBySms?: boolean;
    flightNumber?: string;
    meetGreetEnabled?: boolean;
    meetGreet?: string;
    luggage?: Step3LuggageSelection[];
    childSeats?: Step3ChildSeatSelection[];
    returnFlightNumber?: string;
    returnMeetGreetEnabled?: boolean;
    returnMeetGreet?: string;
    returnChildSeats?: Step3ChildSeatSelection[];
}

export interface Step1FormValues {
    tripType: TripType;
    pickupAddress: string;
    deliveryAddress: string;
    stops: { address: string }[];
    pickupDate: string;
    pickupTime: string;
    hourlyDuration?: number;
}

export type HeroFormValues = Step1FormValues;

export interface Step3FormValues {
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
    luggage: Step3LuggageSelection[];
    meetGreetEnabled: boolean;
    meetGreet: string;
    childSeatsEnabled: boolean;
    childSeats: Step3ChildSeatSelection[];
    returnFlightNumber: string;
    returnMeetGreetEnabled: boolean;
    returnMeetGreet: string;
    returnChildSeatsEnabled: boolean;
    returnChildSeats: Step3ChildSeatSelection[];
}

export type BookingType = "ONE_WAY" | "RETURN" | "HOURLY";

export interface QuoteRequest {
    vehicleCategoryId?: string | undefined;
    vehicleCount?: number;
    bookingType: BookingType;
    hourlyDuration?: number;
    address: BookingDraft["address"];
    bookingTime: BookingDraft["bookingTime"];
    meetAndGreet?: BookingDraft["meetAndGreet"];
    extraServices?: BookingDraft["extraServices"];
    luggage?: BookingDraft["luggage"];
    notifications?: BookingDraft["notifications"];
}

export interface BookingDraft {
    vehicleCategoryId: string;
    vehicleCount: number;
    bookingType: BookingType;
    hourlyDuration?: number;
    address: {
        pickup: { address: string };
        dropoff?: { address: string };
        stops?: { address: string }[];
        distance: number;
        travelDuration: number;
    };
    passenger: {
        passengerCount: number;
        name: string;
        phone: string;
        email: string;
        ccEmail?: string;
    };
    bookingTime: {
        pickupDate: string;
        pickupTime: string;
        returnDate?: string;
        returnTime?: string;
    };
    flightDetails?: { flightNumber?: string };
    meetAndGreet?: { enabled: boolean; signName?: string; returnEnabled?: boolean };
    extraServices?: { extraServiceId: string; quantity: number; returnQuantity: number }[];
    luggage?: { luggageTypeId: string; quantity: number }[];
    notes?: string;
    returnNotes?: string;
    notifications?: { email: boolean; sms: boolean };
    quoteId: string;
}

export type CheckoutStart = {
    url: string;
    orderId: string;
    bookingNumber: string;
};

export type CheckoutSession = {
    orderId: string;
    url: string;
};
