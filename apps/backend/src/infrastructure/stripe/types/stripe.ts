import type { PaymentMode } from "@prisma/client";

export type CheckoutSessionInput = {
  mode: PaymentMode;
  bookingId: string;
  bookingNumber: string;
  amount: number;
  description: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
};

export type CheckoutSession = {
  id: string;
  url: string;
};

export type CheckoutResult = {
  sessionId: string;
  paid: boolean;
  expired: boolean;
  transactionId: string | null;
  amount: number;
  currency: string;
  cardBrand: string | null;
  cardLast4: string | null;
};
