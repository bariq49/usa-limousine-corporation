import { ActivityOwnerType as OwnerType, type Prisma } from "@prisma/client";
import type { ActivityTypeName } from "../constants/activity.constants";

export { OwnerType };
export type { ActivityTypeName };

export type Create = {
  ownerType: OwnerType;
  ownerId: string;
  type: ActivityTypeName | string;
  actorType?: OwnerType | null | undefined;
  actorId?: string | null | undefined;
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
  ownerType: OwnerType;
  ownerId: string;
};

export type Owner = {
  ownerType: OwnerType;
  ownerId: string;
};
