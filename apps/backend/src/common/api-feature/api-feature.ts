import type {
  APIFeatureExecuteOps,
  APIFeatureFindArgs,
  APIFeatureOptions,
  ApiFeatureSortOrder,
  PaginatedResult,
} from "./api-feature.types";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const DEFAULT_PAGE = 1;
const DEFAULT_SORT_BY = "createdAt";
const DEFAULT_SORT_ORDER: ApiFeatureSortOrder = "desc";

const BASE_EXCLUDED_QUERY_KEYS = [
  "page",
  "limit",
  "sort",
  "sortBy",
  "sortOrder",
  "q",
  "search",
  "startDate",
  "endDate",
  "fields",
] as const;

export class APIFeature {
  private readonly queryString: Record<string, unknown>;
  private readonly options: APIFeatureOptions;
  private readonly defaultLimit: number;
  private readonly maxLimit: number;
  private where: Record<string, unknown> = {};
  private orderBy:
    Record<string, ApiFeatureSortOrder> | Array<Record<string, ApiFeatureSortOrder>> = {
    [DEFAULT_SORT_BY]: DEFAULT_SORT_ORDER,
  };
  private page = DEFAULT_PAGE;
  private limit = DEFAULT_LIMIT;
  private skip = 0;
  private take = DEFAULT_LIMIT;

  constructor(queryString: object, options: APIFeatureOptions = {}) {
    this.queryString = { ...(queryString as Record<string, unknown>) };
    this.options = options;
    this.defaultLimit = options.pagination?.defaultLimit ?? DEFAULT_LIMIT;
    this.maxLimit = options.pagination?.maxLimit ?? MAX_LIMIT;
    this.applyOptions();
  }

  filter(fields?: string[]): this {
    const filterFields = fields ?? this.options.filterFields ?? Object.keys(this.queryString);
    const excluded = new Set([
      ...BASE_EXCLUDED_QUERY_KEYS,
      ...(this.options.excludeQueryKeys ?? []),
    ]);

    for (const field of filterFields) {
      if (excluded.has(field)) {
        continue;
      }

      const value = this.queryString[field];
      if (value === undefined || value === null || value === "") {
        continue;
      }

      if (typeof value === "string" && value.includes(",")) {
        this.setFilterField(field, { in: value.split(",").map((item) => item.trim()) });
        continue;
      }

      if (value === "true" || value === true) {
        this.setFilterField(field, true);
        continue;
      }

      if (value === "false" || value === false) {
        this.setFilterField(field, false);
        continue;
      }

      this.setFilterField(field, value);
    }

    return this;
  }

  dateRange(
    field: string,
    startDate?: string | Date,
    endDate?: string | Date,
    startKey = "startDate",
    endKey = "endDate",
  ): this {
    const start = startDate ?? this.getQueryValue(startKey);
    const end = endDate ?? this.getQueryValue(endKey);

    if (!start && !end) {
      return this;
    }

    const range: { gte?: Date; lte?: Date } = {};
    if (start) {
      range.gte = new Date(start);
    }
    if (end) {
      range.lte = new Date(end);
    }

    this.setFilterField(field, range);
    return this;
  }

  search(searchFields: string[], searchTerm?: string): this {
    const term =
      searchTerm?.trim() ||
      this.getQueryString(this.options.search?.searchKey ?? "q")?.trim() ||
      this.getQueryString("search")?.trim();

    if (!term || searchFields.length === 0) {
      return this;
    }

    // Dotted fields search relations, e.g. "customer.user.email".
    const orConditions = searchFields.map((field) =>
      field
        .split(".")
        .reduceRight<Record<string, unknown>>(
          (inner, key) => ({ [key]: inner }),
          { contains: term, mode: "insensitive" },
        ),
    );

    const existingOr = this.where["OR"];
    if (Array.isArray(existingOr)) {
      this.where["OR"] = [...existingOr, ...orConditions];
    } else {
      this.where["OR"] = orConditions;
    }

    return this;
  }

  sort(
    defaultSortBy = DEFAULT_SORT_BY,
    defaultSortOrder: ApiFeatureSortOrder = DEFAULT_SORT_ORDER,
  ): this {
    const sortOptions = this.options.sort;
    const allowedFields = sortOptions?.allowedFields;
    const combinedSortKey = sortOptions?.sortKey ?? "sort";
    const sortByKey = sortOptions?.sortByKey ?? "sortBy";
    const sortOrderKey = sortOptions?.sortOrderKey ?? "sortOrder";

    const combinedSort = this.getQueryString(combinedSortKey);
    if (combinedSort) {
      const entries = combinedSort
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean)
        .map((part) => {
          const descending = part.startsWith("-");
          const field = descending ? part.slice(1) : part;
          if (allowedFields && !allowedFields.includes(field)) {
            return null;
          }
          return { [field]: descending ? ("desc" as const) : ("asc" as const) };
        })
        .filter((entry): entry is Record<string, ApiFeatureSortOrder> => entry !== null);

      if (entries.length === 1) {
        this.orderBy = entries[0]!;
      } else if (entries.length > 1) {
        this.orderBy = entries;
      } else {
        this.orderBy = { [defaultSortBy]: defaultSortOrder };
      }

      return this;
    }

    const sortBy = this.getQueryString(sortByKey) || defaultSortBy;
    const sortOrderValue = this.getQueryString(sortOrderKey)?.toLowerCase();
    const sortOrder: ApiFeatureSortOrder =
      sortOrderValue === "asc" || sortOrderValue === "desc" ? sortOrderValue : defaultSortOrder;

    if (allowedFields && !allowedFields.includes(sortBy)) {
      this.orderBy = { [defaultSortBy]: defaultSortOrder };
      return this;
    }

    this.orderBy = { [sortBy]: sortOrder };
    return this;
  }

  paginate(): this {
    const pageValue = this.options.pagination?.page ?? this.getQueryNumber("page");
    const limitValue = this.options.pagination?.limit ?? this.getQueryNumber("limit");

    this.page = pageValue && pageValue > 0 ? pageValue : DEFAULT_PAGE;
    this.limit = Math.min(
      limitValue && limitValue > 0 ? limitValue : this.defaultLimit,
      this.maxLimit,
    );
    this.skip = (this.page - 1) * this.limit;
    this.take = this.limit;
    return this;
  }

  addFilter(condition: Record<string, unknown>): this {
    this.where = { ...this.where, ...condition };
    return this;
  }

  getFilter(): Record<string, unknown> {
    return this.where;
  }

  getArgs(): APIFeatureFindArgs {
    return {
      where: this.where,
      orderBy: this.orderBy,
      skip: this.skip,
      take: this.take,
    };
  }

  async execute<T>(ops: APIFeatureExecuteOps<T>): Promise<PaginatedResult<T>> {
    const args = this.getArgs();
    const [data, total] = await Promise.all([ops.findMany(args), ops.count({ where: args.where })]);

    const pages = total === 0 ? 0 : Math.ceil(total / this.limit);

    return {
      data,
      total,
      page: this.page,
      limit: this.limit,
      pages,
      hasNextPage: this.page < pages,
      hasPrevPage: this.page > 1,
    };
  }

  async executeAll<T>(findMany: (args: APIFeatureFindArgs) => Promise<T[]>): Promise<T[]> {
    const { where, orderBy } = this.getArgs();
    return findMany({ where, orderBy, skip: 0, take: Number.MAX_SAFE_INTEGER });
  }

  private applyOptions(): void {
    if (this.options.initialFilter) {
      this.where = { ...this.options.initialFilter };
    }

    if (this.options.filterFields && this.options.filterFields.length > 0) {
      this.filter(this.options.filterFields);
    }

    if (this.options.dateRange) {
      this.dateRange(
        this.options.dateRange.field,
        this.options.dateRange.startDate,
        this.options.dateRange.endDate,
        this.options.dateRange.startKey ?? "startDate",
        this.options.dateRange.endKey ?? "endDate",
      );
    }

    if (this.options.search?.searchFields?.length) {
      this.search(this.options.search.searchFields, this.options.search.search);
    }

    const defaultSortBy = this.options.sort?.defaultSortBy ?? DEFAULT_SORT_BY;
    const defaultSortOrder = this.options.sort?.defaultSortOrder ?? DEFAULT_SORT_ORDER;
    this.sort(defaultSortBy, defaultSortOrder);

    if (!this.options.disablePagination) {
      this.paginate();
    }
  }

  private getQueryString(key: string): string | undefined {
    const value = this.queryString[key];
    if (typeof value === "string") {
      return value;
    }
    if (typeof value === "number" || typeof value === "boolean") {
      return String(value);
    }
    return undefined;
  }

  private getQueryValue(key: string): string | Date | undefined {
    const value = this.queryString[key];
    if (value instanceof Date) {
      return value;
    }
    if (typeof value === "string" || typeof value === "number") {
      return String(value);
    }
    return undefined;
  }

  private getQueryNumber(key: string): number | undefined {
    const value = this.queryString[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string" && value.trim() !== "") {
      const parsed = Number.parseInt(value, 10);
      return Number.isFinite(parsed) ? parsed : undefined;
    }
    return undefined;
  }

  private setFilterField(field: string, value: unknown): void {
    this.where[field] = value;
  }
}
