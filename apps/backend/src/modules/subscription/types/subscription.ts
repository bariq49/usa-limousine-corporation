import type { Audience, Prisma, SubscriptionStatus } from "@prisma/client";

export type CreateData = {
  planId: string;
  audience: Audience;
  referenceId: string;
  status?: SubscriptionStatus;
};

export type PeriodData = {
  subscriptionId: string;
  planId: string;
  periodStart: Date;
  periodEnd: Date;
  tripsLimit: number | null;
};

export type EventData = {
  subscriptionId: string;
  type: string;
  payload?: Prisma.InputJsonValue;
};

export type OpenPeriodUpdate = {
  subscriptionId: string;
  planId: string;
  tripsLimit: number | null;
};

export type IdQuery = {
  id: string;
};

export type OwnerQuery = {
  audience: Audience;
  referenceId: string;
};

export type UpdateInput = {
  id: string;
  data: Prisma.SubscriptionUpdateInput;
};

export type NowQuery = {
  now: Date;
};

export type TrialEndingQuery = {
  from: Date;
  to: Date;
};

export type Owner = {
  referenceId: string;
  freeUsedAt: Date | null;
};

export type Start = {
  audience: Audience;
  owner: Owner;
  planId: string;
};

export type Upgrade = {
  audience: Audience;
  referenceId: string;
  planId: string;
};

export type OffSessionRenew = {
  id: string;
  audience: Audience;
  referenceId: string;
  stripeCustomerId: string;
  stripePaymentMethodId: string;
  dunningAttempts: number;
  plan: { name: string; amount: unknown };
  now: Date;
};

export type AttachPaymentMethod = {
  customerId?: string | null | undefined;
  paymentMethodId?: string | null | undefined;
};
