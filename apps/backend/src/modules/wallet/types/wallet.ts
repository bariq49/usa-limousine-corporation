import type { WalletOwnerType, WalletTransactionType } from "@prisma/client";

export type Owner = {
  ownerType: WalletOwnerType;
  ownerId: string;
};

export type Credit = {
  walletId: string;
  tripId: string;
  bookingId: string;
  amount: number;
  description?: string;
};

export type CreditResult = {
  credited: boolean;
  skipped?: boolean;
  reason?: string;
  walletId?: string;
  transactionId?: string;
  balance?: number;
  amount?: number;
  tripId?: string;
  bookingId?: string;
};

export type Debit = {
  walletId: string;
  payoutId: string;
  amount: number;
  description?: string;
};

export type DebitResult = {
  debited: boolean;
  walletId?: string;
  transactionId?: string;
  balance?: number;
  amount?: number;
  payoutId?: string;
};

export type Query = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  sort?: string;
  q?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  type?: WalletTransactionType;
};

export type List = Query & {
  walletId: string;
};

export type Summary = {
  id: string;
  balance: number;
  updatedAt: Date;
};
