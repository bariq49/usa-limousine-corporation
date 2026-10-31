"use client";

import { useMemo, useState } from "react";
import { Breadcrumbs } from "@usa-limousine-corporation/ui/layout/breadcrumbs";
import { Card, CardContent } from "@usa-limousine-corporation/ui/components/card";
import {
  DataTable,
  type ColumnFiltersState,
} from "@usa-limousine-corporation/ui/components/data-table/data-table";
import { filter, getColumns } from "@/components/columns/refund-columns";
import { useRefunds } from "@/hooks/queries/use-refunds";
import type { RefundStatus } from "@/lib/types/payments";

export default function CustomerRefundsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const statusFilter = columnFilters.find((f) => f.id === "Status")?.value;
  const status = (Array.isArray(statusFilter) ? statusFilter[0] : statusFilter) as
    RefundStatus | undefined;

  const { data, isLoading, isFetching } = useRefunds({
    page,
    limit: pageSize,
    search: search || undefined,
    status: status || undefined,
  });

  const columns = useMemo(() => getColumns(), []);

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: "Home", href: "/dashboard" }, { label: "Refunds" }]} />

      <Card className="shadow-xs border border-border bg-card">
        <CardContent className="p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-default-900">Refunds</h2>
            <p className="text-xs text-default-500 mt-1">
              View your cancellation refund requests and processed refunds.
            </p>
          </div>

          <DataTable
            columns={columns}
            data={data?.data ?? []}
            searchKey="search"
            searchValue={search}
            onSearchChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            searchPlaceholder="Search by reason or refund ID..."
            filterColumns={filter}
            columnFilters={columnFilters}
            onColumnFiltersChange={(updater) => {
              setColumnFilters(updater);
              setPage(1);
            }}
            manualFiltering={true}
            loading={isLoading}
            fetching={isFetching}
            pagination={{
              page,
              pageSize,
              total: data?.total ?? 0,
              totalPages: data?.pages ?? 1,
            }}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </CardContent>
      </Card>
    </div>
  );
}
