import type { WalletOwnerType } from "@prisma/client";

export type WalletSummaryRecipient = {
  type: WalletOwnerType;
  id: string;
};

export type WalletSummary = {
  walletBalance: number;
  paidOut: number;
  totalEarned: number;
  available: number;
  processing: number;
  payoutMin: number;
  payoutIntervalDays: number;
  hasBankAccount: boolean;
  canRequestPayout: boolean;
};
