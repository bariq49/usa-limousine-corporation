import type { BookingType } from "@prisma/client";
import type { BookingPricing } from "../../platform-settings/types/platform-settings";

export type BookingEmail = {
  id: string;
  bookingNumber: string;
  hasAccount: boolean;
  bookingType: BookingType;
  vehicleCount: number;
  vehicle: {
    name: string;
    description: string | null;
    image: string | null;
    passengerCount: number;
  };
  pickupAddress: string;
  dropoffAddress: string | null;
  stops: string[];
  distance: number;
  duration: number;
  pickupDate: string;
  pickupTime: string;
  returnDate: string | null;
  returnTime: string | null;
  passenger: {
    name: string;
    email: string;
    phone: string;
    ccEmail: string | null;
    passengerCount: number;
  };
  flight: { airline: string | null; number: string | null };
  meetAndGreet: { enabled: boolean; returnEnabled: boolean; signName: string | null };
  luggage: { name: string; quantity: number }[];
  extras: { name: string; quantity: number; unitPrice: number }[];
  notes: string | null;
  pricing: Partial<BookingPricing> & { total: number };
};

export type EmailContext = {
  siteUrl: string;
  portalUrl: string;
  reviewUrl?: string | undefined;
};
