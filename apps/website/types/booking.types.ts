import type { CategoryByDistance } from './vehicle-category.types';
import type { BookingSettings } from './settings.types';

export type { BookingSettings };

export type TripType = "one-way" | "return" | "hourly";

export type ServiceType =
  | 'airport-transfer'
  | 'hourly-transfer'
  | 'point-to-point-transfer'
  | 'city-transfer'
  | 'wedding-special-occasion'
  | 'corporate-transfer'
  | 'nightlife'
  | (string & {});

export type VehicleCategory = CategoryByDistance;

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
    serviceType: ServiceType;
    tripType: TripType;
    pickupAddress: string;
    deliveryAddress: string;
    stops: { address: string }[];
    pickupDate: string;
    pickupTime: string;
    distance?: number;
    travelDuration?: number;
    duration?: number;
    isAirportSelected?: boolean;
}

export interface BookingStep2PersistedData {
    vehicleCategory: VehicleCategory;
    passengers: number;
    bags: number;
}

export type Step2ContinueProp = {
    vehicleCategory: VehicleCategory;
    passengers: number;
    luggage: number;
};

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
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
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
    returnNotes?: string;
    returnChildSeats?: Step3ChildSeatSelection[];
}

export interface Step1FormValues {
    tripType: TripType;
    pickupAddress: string;
    deliveryAddress: string;
    stops: { address: string }[];
    pickupDate: string;
    pickupTime: string;
    duration?: number;
}

export type HeroFormValues = Step1FormValues;
export type EditFormValues = Step1FormValues;

export interface Step3FormValues {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    airlineName: string;
    flightNumber: string;
    notes: string;
    notesEnabled: boolean;
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
    returnNotes: string;
    returnNotesEnabled: boolean;
    returnChildSeatsEnabled: boolean;
    returnChildSeats: Step3ChildSeatSelection[];
}

export type BookingType = "ONE_WAY" | "RETURN" | "HOURLY";

/** Booking request in the backend's create shape; the customer portal submits it after sign-in. */
export interface BookingDraft {
    vehicleCategoryId: string;
    vehicleCategoryName: string;
    bookingType: BookingType;
    address: {
        pickup: { address: string };
        dropoff?: { address: string };
        stops?: { address: string }[];
        distance: number;
        duration: number;
    };
    passenger: {
        passengerCount: number;
        name: string;
        phone: string;
        email: string;
        specialInstructions?: string;
        flightNumber?: string;
    };
    bookingTime: {
        pickupDate: string;
        pickupTime: string;
        returnDate?: string;
        returnTime?: string;
    };
    flightDetails?: { flightName?: string; flightNumber?: string };
    meetAndGreet?: { enabled: boolean; signName?: string; returnEnabled?: boolean };
    extraServices?: { extraServiceId: string; quantity: number }[];
    luggage?: { luggageTypeId: string; quantity: number }[];
    notes?: string;
    pricing: {
        basePrice: number;
        stopsPrice?: number;
        airportPickupPrice?: number;
        extraServicesPrice?: number;
        total: number;
    };
}
