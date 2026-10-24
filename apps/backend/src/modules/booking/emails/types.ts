import type { BookingType } from "@prisma/client";
import type { BookingPricing } from "../../platform-settings/types/platform-settings";

/** Booking flattened for the email templates. */
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
  /** Miles. */
  distance: number;
  /** Minutes; the hired time for hourly bookings. */
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
  /** Server-priced bookings carry the full breakdown; admin bookings only the total. */
  pricing: Partial<BookingPricing> & { total: number };
};

/** Values every booking email needs from the environment. */
export type EmailContext = {
  siteUrl: string;
  /** Customer portal; customer emails link to the booking there. */
  portalUrl: string;
  reviewUrl?: string | undefined;
};
