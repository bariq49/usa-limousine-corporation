import type { BookingType } from "@prisma/client";
import type { BookingPricing } from "../../../modules/platform-settings/types/platform-settings";

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
  travelDuration: number;
  hourlyDuration: number | null;
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

export type BookingMailProps = {
  booking: BookingEmail;
  siteUrl: string;
  reviewUrl?: string | undefined;
  paid?: boolean | undefined;
  admin?: boolean | undefined;
};

export type BookingCancelMailProps = {
  booking: BookingEmail;
  siteUrl: string;
  reason: string | null;
  refundAmount: number;
  admin?: boolean | undefined;
  byCustomer?: boolean | undefined;
};

export type DriverAssignedMailProps = {
  booking: BookingEmail;
  siteUrl: string;
  assignment: {
    driverName: string;
    driverAmount: number;
    note: string | null;
  };
};

export type ReceiptPayment = {
  status: string;
  amount: number;
  cardBrand: string | null;
  cardLast4: string | null;
  transactionId: string | null;
  paidAt: Date | null;
  refundedAmount: number | null;
  refundedAt: Date | null;
};

export type ReceiptProps = {
  booking: BookingEmail;
  payment: ReceiptPayment | null;
  issuedAt: Date;
  logo: Buffer | null;
  siteUrl: string;
};
