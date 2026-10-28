import type { BookingType } from "@prisma/client";
import type { BookingPricing } from "../../../../modules/platform-settings/types/platform-settings";

export type BookingEmail = {
  id: string;
  bookingNumber: string;
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
  flight: { number: string | null };
  meetAndGreet: { enabled: boolean; returnEnabled: boolean; signName: string | null };
  luggage: { name: string; quantity: number }[];
  extras: { name: string; quantity: number; returnQuantity: number; unitPrice: number }[];
  notes: string | null;
  returnNotes: string | null;
  pricing: Partial<BookingPricing> & { total: number };
};

export type EmailContext = {
  siteUrl: string;
  assetsUrl: string;
  reviewUrl?: string | undefined;
};

export type ContactPreferences = {
  email: boolean;
  sms: boolean;
};
