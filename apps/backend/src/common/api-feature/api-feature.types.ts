export type ApiFeatureSortOrder = "asc" | "desc";

export type PaginationOptions = {
  page?: number;
  limit?: number;
  defaultLimit?: number;
  maxLimit?: number;
};

export type SortOptions = {
  /** Query key for combined sort, e.g. `sort=-createdAt` */
  sortKey?: string;
  /** Nest-style field key (default: sortBy) */
  sortByKey?: string;
  /** Nest-style order key (default: sortOrder) */
  sortOrderKey?: string;
  defaultSortBy?: string;
  defaultSortOrder?: ApiFeatureSortOrder;
  allowedFields?: string[];
};

export type DateRangeFilter = {
  field: string;
  startDate?: string | Date;
  endDate?: string | Date;
  startKey?: string;
  endKey?: string;
};

export type SearchOptions = {
  search?: string;
  /** Query key for search term (default: q, also reads search) */
  searchKey?: string;
  searchFields?: string[];
};

export type APIFeatureOptions = {
  pagination?: PaginationOptions;
  sort?: SortOptions;
  dateRange?: DateRangeFilter;
  search?: SearchOptions;
  filterFields?: string[];
  initialFilter?: Record<string, unknown>;
  disablePagination?: boolean;
  /** Query keys ignored when auto-filtering */
  excludeQueryKeys?: string[];
};

export type APIFeatureFindArgs = {
  where: Record<string, unknown>;
  orderBy: Record<string, ApiFeatureSortOrder> | Array<Record<string, ApiFeatureSortOrder>>;
  skip: number;
  take: number;
};

export type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type APIFeatureExecuteOps<T> = {
  findMany: (args: APIFeatureFindArgs) => Promise<T[]>;
  count: (args: Pick<APIFeatureFindArgs, "where">) => Promise<number>;
};
