import type { Status } from "./vehicle-pricing";

export type { Status };

export type Item = {
  id: string;
  vehicleCategoryId: string;
  durationHours: number;
  basePrice: number;
  includedDistance: number;
  extraDistanceRate: number;
  status: Status;
  createdAt: string;
  updatedAt: string;
  vehicleCategory?: {
    id: string;
    name: string;
    image?: string | null | undefined;
    passengerCount?: number;
  } | undefined;
};

export type Query = {
  page?: number | undefined;
  limit?: number | undefined;
  search?: string | undefined;
  vehicleCategoryId?: string | undefined;
  status?: Status | undefined;
  durationHours?: number | undefined;
  sortBy?: string | undefined;
  sortOrder?: "asc" | "desc" | undefined;
};

export type List = {
  data: Item[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type CreatePayload = {
  vehicleCategoryId: string;
  durationHours: number;
  basePrice: number;
  includedDistance?: number;
  extraDistanceRate?: number;
  status?: Status;
};

export type UpdatePayload = Partial<CreatePayload>;
