export type LuggageCategoryCapacity = {
  id: string;
  categoryId: string;
  quantity: number;
  category?:
    | {
        id: string;
        name: string;
      }
    | undefined;
};

export type Item = {
  id: string;
  name: string;
  description?: string | null | undefined;
  dimensions?: string | null | undefined;
  image?: string | null | undefined;
  price?: number | string | null | undefined;
  isActive: boolean;
  capacities?: LuggageCategoryCapacity[] | undefined;
  _count?:
    | {
        capacities: number;
      }
    | undefined;
  createdAt: string;
  updatedAt: string;
};

export type CreatePayload = {
  name: string;
  description?: string | null | undefined;
  dimensions?: string | null | undefined;
  image?: string | null | undefined;
  price?: number | null | undefined;
  isActive?: boolean | undefined;
};

export type UpdatePayload = Partial<CreatePayload>;

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
