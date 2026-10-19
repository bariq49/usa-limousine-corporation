export type LuggageCapacity = {
  id: string;
  categoryId: string;
  luggageTypeId: string;
  quantity: number;
  createdAt?: string;
  updatedAt?: string;
  luggageType?:
    | {
        id: string;
        name: string;
        description?: string | null;
        dimensions?: string | null;
        image?: string | null;
        price?: string | null;
        isSpecial?: boolean;
        isActive?: boolean;
        createdAt?: string;
        updatedAt?: string;
      }
    | undefined;
};

export type Item = {
  id: string;
  name: string;
  description?: string | null | undefined;
  image?: string | null | undefined;
  passengerCount: number;
  isActive: boolean;
  luggageCapacity?: LuggageCapacity[] | undefined;
  createdAt: string;
  updatedAt: string;
};

export type Query = {
  page?: number | undefined;
  limit?: number | undefined;
  search?: string | undefined;
  isActive?: boolean | undefined;
  sortBy?: string | undefined;
  sortOrder?: "asc" | "desc" | undefined;
};

export type ListResponse = {
  data: Item[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type LuggageCapacityInput = {
  luggageTypeId: string;
  quantity: number;
};

export type CreatePayload = {
  name: string;
  description?: string;
  image?: string;
  passengerCount: number;
  standardLuggageCapacity: LuggageCapacityInput[];
  specialLuggageCapacity?: LuggageCapacityInput[];
};

export type UpdatePayload = {
  name?: string;
  description?: string | null;
  image?: string | null;
  passengerCount?: number;
  isActive?: boolean;
  standardLuggageCapacity?: LuggageCapacityInput[];
  specialLuggageCapacity?: LuggageCapacityInput[];
};
