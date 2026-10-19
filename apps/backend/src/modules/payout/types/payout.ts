import type { PayoutStatus, WalletOwnerType } from "@prisma/client";

export type PayoutRecipient = {
  type: WalletOwnerType;
  id: string;
};

export type PayoutBankDestination = {
  bankAccountId: string;
  accountHolderName: string;
  iban: string;
  bic: string | null;
  bankName: string | null;
};

export type ResolveBank = {
  recipient: PayoutRecipient;
  bankAccountId?: string;
};

export type RequestPayout = {
  recipient: PayoutRecipient;
  amount: number;
  bankAccountId?: string;
  idempotencyKey?: string;
  notes?: string;
};

export type CreateData = RequestPayout &
  PayoutBankDestination & {
    payoutNumber: string;
    userId: string;
  };

export type UpdateStatusData = {
  failureReason?: string;
  notes?: string;
};

export type StatusUpdate = {
  status: PayoutStatus;
  approvedAt?: Date;
  processingAt?: Date;
  paidAt?: Date;
  rejectedAt?: Date;
  cancelledAt?: Date;
  failureReason?: string | null;
  notes?: string;
};

export type SettleData = {
  payoutId: string;
  walletId: string;
};

export type ReconcileSummary = {
  staleApproved: number;
  paidWithoutDebit: number;
  overReserved: number;
};
