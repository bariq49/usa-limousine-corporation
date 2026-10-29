"use client";

import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type OnChangeFn,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { cn } from "../../utils/cn";
import { Skeleton } from "../skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../table";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar, type DataTableFilterColumn } from "./data-table-toolbar";

export type { ColumnDef, Row, ColumnFiltersState } from "@tanstack/react-table";
export type { DataTableFilterColumn } from "./data-table-toolbar";

export type DataTablePaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export interface DataTableProps<TData, TValue = unknown> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string | undefined;
  searchValue?: string | undefined;
  searchPlaceholder?: string | undefined;
  onSearchChange?: ((value: string) => void) | undefined;
  filterColumns?: DataTableFilterColumn[] | undefined;
  columnFilters?: ColumnFiltersState | undefined;
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState> | undefined;
  manualFiltering?: boolean | undefined;
  initialColumnVisibility?: VisibilityState | undefined;
  loading?: boolean | undefined;
  fetching?: boolean | undefined;
  error?: string | null | undefined;
  pagination?: DataTablePaginationMeta | undefined;
  onPageChange?: ((page: number) => void) | undefined;
  onPageSizeChange?: ((pageSize: number) => void) | undefined;
  onBulkDelete?: ((selectedRows: TData[]) => void | Promise<void>) | undefined;
  isDeleting?: boolean | undefined;
  hideToolbar?: boolean | undefined;
  pageSizeOptions?: number[] | undefined;
  className?: string | undefined;
  skeletonRowCount?: number | undefined;
}

function getDefaultRowId<TData>(row: TData, index: number): string {
  const record = row as { id?: string };
  return record.id ?? String(index);
}

export function DataTable<TData, TValue = unknown>({
  columns,
  data,
  searchKey,
  searchValue,
  searchPlaceholder,
  onSearchChange,
  filterColumns = [],
  columnFilters: controlledColumnFilters,
  onColumnFiltersChange: controlledOnColumnFiltersChange,
  manualFiltering = false,
  initialColumnVisibility,
  loading = false,
  fetching = false,
  error = null,
  pagination,
  onPageChange,
  onPageSizeChange,
  onBulkDelete,
  isDeleting = false,
  hideToolbar = false,
  pageSizeOptions,
  className,
  skeletonRowCount = 5,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(
    initialColumnVisibility ?? {},
  );
  const [internalColumnFilters, setInternalColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const columnFilters = controlledColumnFilters ?? internalColumnFilters;
  const onColumnFiltersChange = controlledOnColumnFiltersChange ?? setInternalColumnFilters;
  const isManualPagination = !!pagination;
  const totalPages = isManualPagination ? (pagination.totalPages ?? 1) : undefined;

  const table = useReactTable({
    data,
    columns,
    getRowId: (row, index) => getDefaultRowId(row, index),
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      ...(pagination
        ? {
            pagination: {
              pageIndex: pagination.page - 1,
              pageSize: pagination.pageSize,
            },
          }
        : {}),
    },
    ...(totalPages !== undefined ? { pageCount: totalPages } : {}),
    enableRowSelection: true,
    autoResetPageIndex: false,
    manualFiltering,
    manualPagination: isManualPagination,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  React.useEffect(() => {
    if (pagination?.pageSize) {
      table.setPageSize(pagination.pageSize);
    }
  }, [pagination?.pageSize, table]);

  const visibleColumns = table.getVisibleLeafColumns();
  const colSpan = visibleColumns.length || columns.length;
  const dataRows = table.getRowModel().rows;
  const effectiveSkeletonRows =
    skeletonRowCount ?? (pagination?.pageSize ? Math.min(pagination.pageSize, 10) : 5);

  return (
    <div className={cn("space-y-4", className)}>
      {hideToolbar ? null : (
        <DataTableToolbar
          table={table}
          searchKey={searchKey}
          searchValue={searchValue}
          searchPlaceholder={searchPlaceholder}
          onSearchChange={onSearchChange}
          filterColumns={filterColumns}
          manualFiltering={manualFiltering}
          onBulkDelete={onBulkDelete}
          isDeleting={isDeleting}
        />
      )}
      <div className="relative overflow-hidden rounded-md border border-border bg-background">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: effectiveSkeletonRows }).map((_, rowIndex) => (
                <TableRow key={`skeleton-row-${rowIndex}`}>
                  {visibleColumns.map((column) => (
                    <TableCell key={`skeleton-cell-${rowIndex}-${column.id}`}>
                      {column.id === "select" ? (
                        <Skeleton className="h-4 w-4 rounded" />
                      ) : column.id === "actions" ? (
                        <div className="flex justify-end">
                          <Skeleton className="h-8 w-8 rounded-md" />
                        </div>
                      ) : (
                        <Skeleton className="h-4 w-[75%]" />
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell colSpan={colSpan}>
                  <div className="flex items-center justify-center py-10 font-medium text-destructive">
                    {error}
                  </div>
                </TableCell>
              </TableRow>
            ) : dataRows.length ? (
              dataRows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() ? "selected" : undefined}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={colSpan}>
                  <div className="flex items-center justify-center py-10 text-muted-foreground">
                    No results found.
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination
        table={table}
        totalRows={isManualPagination ? pagination.total : table.getFilteredRowModel().rows.length}
        loading={loading}
        fetching={fetching}
        currentPage={
          isManualPagination ? (pagination.page ?? 1) : table.getState().pagination.pageIndex + 1
        }
        totalPages={isManualPagination ? totalPages : table.getPageCount()}
        pageSizeOptions={pageSizeOptions}
        onPageChange={(page) => {
          if (onPageChange) onPageChange(page);
          else table.setPageIndex(page - 1);
        }}
        onPageSizeChange={(size) => {
          if (onPageSizeChange) onPageSizeChange(size);
          else table.setPageSize(size);
        }}
      />
    </div>
  );
}
