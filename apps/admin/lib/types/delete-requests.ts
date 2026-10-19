export type DeleteRequestStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export type DeleteRequestDriver = {
  id: string;
  applicationNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  avatarUrl?: string | null;
  status?: string | null;
  deletedAt?: string | null;
};

export type DeleteRequest = {
  id: string;
  driverId: string;
  reason?: string | null;
  status: DeleteRequestStatus;
  processedAt?: string | null;
  processedBy?: string | null;
  adminNote?: string | null;
  createdAt: string;
  updatedAt: string;
  driver: DeleteRequestDriver;
};

export type DeleteRequestResponse = {
  request: DeleteRequest | null;
};

export type Query = {
  page?: number | undefined;
  limit?: number | undefined;
  search?: string | undefined;
  status?: DeleteRequestStatus | undefined;
  sortBy?: string | undefined;
  sortOrder?: "asc" | "desc" | undefined;
};

export type ListResponse = {
  data: DeleteRequest[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type RejectPayload = {
  adminNote?: string;
};
