export type Type = "FIXED" | "PER_UNIT" | "PERCENTAGE";
export type Status = "ACTIVE" | "INACTIVE";

export type Item = {
  id: string;
  vehicleCategoryId: string;
  minimumDistance: number | string;
  maximumDistance: number | string | null;
  pricingType: Type;
  basePrice: number | string;
  perUnitRate: number | string | null;
  percentageRate: number | string | null;
  status: Status;
  createdAt: string;
  updatedAt: string;
  vehicleCategory?:
    | {
        id: string;
        name: string;
        image?: string | null | undefined;
        passengerCount?: number;
      }
    | undefined;
};

export type Query = {
  page?: number | undefined;
  limit?: number | undefined;
  search?: string | undefined;
  vehicleCategoryId?: string | undefined;
  status?: Status | undefined;
  pricingType?: Type | undefined;
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
  minimumDistance: number;
  maximumDistance?: number | null;
  pricingType: Type;
  basePrice: number;
  perUnitRate?: number | null;
  percentageRate?: number | null;
  status?: Status;
};

export type UpdatePayload = Partial<CreatePayload>;
