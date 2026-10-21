import type { Prisma } from "@prisma/client";
import type { ActivityTypeName } from "../constants/activity.constants";

export type { ActivityTypeName };

export type Create = {
  customerId: string;
  type: ActivityTypeName | string;
  /** User who performed the action (staff or the customer). */
  actorUserId?: string | null | undefined;
  data?: Prisma.InputJsonValue | null | undefined;
};

export type Query = {
  page?: number | undefined;
  limit?: number | undefined;
  sortBy?: string | undefined;
  sortOrder?: "asc" | "desc" | undefined;
  sort?: string | undefined;
  q?: string | undefined;
  search?: string | undefined;
  startDate?: string | undefined;
  endDate?: string | undefined;
  type?: string | undefined;
};

export type List = Query & {
  customerId: string;
};

export type Owner = {
  customerId: string;
};
