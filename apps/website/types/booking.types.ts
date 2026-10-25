import type { VehicleCategory } from './vehicle-category.types';
import type { BookingSettings } from './settings.types';

export type { BookingSettings };

export type TripType = "one-way" | "return" | "hourly";

export type { VehicleCategory };

export type Pricing = {
    oneWayBasePrice: number;
    oneWaySurchargePercentage: number;
    oneWaySurchargeAmount: number;
    oneWayGratuityPercentage: number;
    oneWayGratuityAmount: number;
    oneWayTaxPercentage: number;
    oneWayTaxAmount: number;
    oneWayTransactionFeePercentage: number;
    oneWayTransactionFeeAmount: number;
    oneWayDiscountPercentage: number;
    oneWayDiscountAmount: number;
    oneWayAirportFeeAmount: number;
    oneWayTotalPrice: number;
    returnBasePrice: number;
    returnSurchargePercentage: number;
    returnSurchargeAmount: number;
    returnGratuityPercentage: number;
    returnGratuityAmount: number;
    returnTaxPercentage: number;
    returnTaxAmount: number;
    returnTransactionFeePercentage: number;
    returnTransactionFeeAmount: number;
    returnDiscountPercentage: number;
    returnDiscountAmount: number;
    returnAirportFeeAmount: number;
    returnTotalPrice: number;
    stopFeeAmount: number;
    luggageFeeAmount: number;
    oneWayMeetAndGreetFeeAmount: number;
    returnMeetAndGreetFeeAmount: number;
    oneWayChildSeatFeeAmount: number;
    returnChildSeatFeeAmount: number;
    subtotal: number;
    total: number;
};

export interface BookingStep1PersistedData {
    tripType: TripType;
    pickupAddress: string;
    deliveryAddress: string;
    stops: { address: string }[];
    distance?: number;
    travelDuration?: number;
    duration?: number;
    isAirportSelected?: boolean;
}

export interface BookingStep2PersistedData {
    vehicleCategory: VehicleCategory;
    /** Vehicles of the category booked; capacity and fare scale with it. */
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
    pickupDate: string;
    pickupTime: string;
    notes?: string;
    airlineName?: string;
    flightNumber?: string;
    meetGreetEnabled?: boolean;
    meetGreet?: string;
    luggage?: Step3LuggageSelection[];
    childSeats?: Step3ChildSeatSelection[];
    returnEnabled?: boolean;
    returnDate?: string;
    returnTime?: string;
    returnAirlineName?: string;
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
    duration?: number;
}

export type HeroFormValues = Step1FormValues;

export interface Step3FormValues {
    title: string;
    fullName: string;
    phone: string;
    email: string;
    ccEmailEnabled: boolean;
    ccEmail: string;
    pickupDate: string;
    pickupTime: string;
    airlineName: string;
    flightNumber: string;
    notes: string;
    luggage: Step3LuggageSelection[];
    meetGreetEnabled: boolean;
    meetGreet: string;
    childSeatsEnabled: boolean;
    childSeats: Step3ChildSeatSelection[];
    returnEnabled: boolean;
    returnDate: string;
    returnTime: string;
    returnAirlineName: string;
    returnFlightNumber: string;
    returnMeetGreetEnabled: boolean;
    returnMeetGreet: string;
    returnChildSeatsEnabled: boolean;
    returnChildSeats: Step3ChildSeatSelection[];
}

export type BookingType = "ONE_WAY" | "RETURN" | "HOURLY";

/** Booking request in the backend's create shape, sent to start Square checkout. */
export interface BookingDraft {
    vehicleCategoryId: string;
    vehicleCount: number;
    bookingType: BookingType;
    address: {
        pickup: { address: string };
        dropoff?: { address: string };
        stops?: { address: string }[];
        distance: number;
        duration: number;
        travelDuration?: number;
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
    flightDetails?: { flightName?: string; flightNumber?: string };
    meetAndGreet?: { enabled: boolean; signName?: string; returnEnabled?: boolean };
    extraServices?: { extraServiceId: string; quantity: number; returnQuantity: number }[];
    luggage?: { luggageTypeId: string; quantity: number }[];
    notes?: string;
    pricing: {
        basePrice: number;
        total: number;
    };
}

export type CheckoutStart = {
    url: string;
    orderId: string;
    bookingNumber: string;
};

/** Square checkout the rider was sent to, kept so the cancel page can show and resume it. */
export type CheckoutSession = {
    orderId: string;
    url: string;
};
