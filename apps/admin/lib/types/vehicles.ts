export type Item = {
  id: string;
  driverId: string;
  vehicleCategoryId: string;
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null | undefined;
  driver?:
    | {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        user?:
          | {
              id: string;
              email: string;
            }
          | undefined;
      }
    | undefined;
  vehicleCategory?:
    | {
        id: string;
        name: string;
        image?: string | null | undefined;
        passengerCount: number;
      }
    | undefined;
};

export type Query = {
  page?: number | undefined;
  limit?: number | undefined;
  search?: string | undefined;
  vehicleCategoryId?: string | undefined;
  make?: string | undefined;
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
