"use client";

import { Button } from "../button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "../../utils/cn";
import { Skeleton } from "../skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../select";
import type { Table } from "@tanstack/react-table";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  totalRows?: number | undefined;
  loading?: boolean | undefined;
  fetching?: boolean | undefined;
  onPageChange?: ((page: number) => void) | undefined;
  onPageSizeChange?: ((pageSize: number) => void) | undefined;
  currentPage?: number | undefined;
  totalPages?: number | undefined;
  pageSizeOptions?: number[] | undefined;
  className?: string | undefined;
}

export function DataTablePagination<TData>({
  table,
  totalRows = 0,
  loading = false,
  fetching = false,
  onPageChange,
  onPageSizeChange,
  currentPage = 1,
  totalPages = 1,
  pageSizeOptions = [10, 20, 30, 40, 50],
  className,
}: DataTablePaginationProps<TData>) {
  const pageSize = table.getState().pagination.pageSize;
  const startRow = totalRows === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRow = Math.min(currentPage * pageSize, totalRows);
  const isDisabled = loading || fetching;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 px-2 py-3 pb-16 sm:pb-3 md:flex-row md:items-center md:justify-between md:gap-2",
        className,
      )}
    >
      <div className="text-sm text-muted-foreground">
        {loading ? (
          <Skeleton className="h-4 w-44" />
        ) : (
          <span className="whitespace-nowrap">
            Showing{" "}
            <span className="font-medium">
              {startRow}-{endRow}
            </span>{" "}
            of <span className="font-medium">{totalRows}</span> total row
            {totalRows !== 1 ? "s" : ""}
            {fetching ? " · Updating..." : ""}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 md:justify-end md:gap-6 lg:gap-8">
        {pageSizeOptions.length > 1 && (
          <div className="flex items-center gap-2">
            <p className="hidden text-sm font-medium text-muted-foreground whitespace-nowrap sm:block">
              Rows per page
            </p>
            <p className="text-sm font-medium text-muted-foreground sm:hidden">Rows</p>
            <Select
              value={`${pageSize}`}
              onValueChange={(value) => {
                const newPageSize = Number(value);
                table.setPageSize(newPageSize);
                table.setPageIndex(0);
                onPageSizeChange?.(newPageSize);
                onPageChange?.(1);
              }}
              disabled={isDisabled}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="whitespace-nowrap text-sm font-medium text-muted-foreground">
            <span className="sm:hidden">
              {currentPage}/{totalPages}
            </span>
            <span className="hidden sm:inline">
              Page {currentPage} of {totalPages}
            </span>
          </span>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => onPageChange?.(1)}
            disabled={currentPage <= 1 || isDisabled}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="h-4 w-4 rtl:rotate-180" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange?.(currentPage - 1)}
            disabled={currentPage <= 1 || isDisabled}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange?.(currentPage + 1)}
            disabled={currentPage >= totalPages || isDisabled}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="h-4 w-4 rtl:rotate-180" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => onPageChange?.(totalPages)}
            disabled={currentPage >= totalPages || isDisabled}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className="h-4 w-4 rtl:rotate-180" />
          </Button>
        </div>
      </div>
    </div>
  );
}
