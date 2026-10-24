import type { PaymentMode } from "@prisma/client";

export type PaymentLinkInput = {
  mode: PaymentMode;
  bookingNumber: string;
  amount: number;
  description: string;
  customerEmail: string;
  redirectUrl: string;
};

export type PaymentLink = {
  id: string;
  orderId: string;
  url: string;
};

export type OrderResult = {
  orderId: string;
  paid: boolean;
  paymentId: string | null;
  amount: number;
  currency: string;
  cardBrand: string | null;
  cardLast4: string | null;
};
