export type ExtraServiceType = "CHILD_SEAT" | "EXTRA";

export type Item = {
  id: string;
  name: string;
  image?: string | null | undefined;
  description?: string | null | undefined;
  price: number | string;
  type: ExtraServiceType;
  maxQuantity: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type Query = {
  page?: number | undefined;
  limit?: number | undefined;
  search?: string | undefined;
  type?: ExtraServiceType | undefined;
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

export type CreatePayload = {
  name: string;
  image?: string | null | undefined;
  description?: string | undefined;
  price: number;
  type?: ExtraServiceType | undefined;
  maxQuantity?: number | undefined;
  isActive?: boolean | undefined;
  sortOrder?: number | undefined;
};

export type UpdatePayload = Partial<CreatePayload>;
