import type { Audience, SubscriptionInterval } from "@prisma/client";

export type CreateData = {
  audience: Audience;
  name: string;
  description: string | null;
  interval: SubscriptionInterval;
  amount: number;
  tripsPerMonth: number | null;
  features: string[];
  freeMonths: number;
  freeDays: number;
  graceDays: number;
  isPopular: boolean;
  isActive: boolean;
  sortOrder: number;
};

export type UpdateData = {
  name?: string;
  description?: string | null;
  interval?: SubscriptionInterval;
  amount?: number;
  tripsPerMonth?: number | null;
  features?: string[];
  freeMonths?: number;
  freeDays?: number;
  graceDays?: number;
  isPopular?: boolean;
  isActive?: boolean;
  sortOrder?: number;
};
