"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Breadcrumbs } from "@usa-limousine-corporation/ui/layout/breadcrumbs";
import { Card, CardContent } from "@usa-limousine-corporation/ui/components/card";
import {
  DataTable,
  type ColumnFiltersState,
} from "@usa-limousine-corporation/ui/data-table/data-table";
import { useDrivers, useBulkDelete } from "@/hooks/queries/use-drivers";
import type { Driver, Status } from "@/lib/types/drivers";
import { getColumns, filter } from "@/components/columns/driver-columns";

export default function DriversPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const selectedStatus = useMemo(() => {
    const statusCol = columnFilters.find((f) => f.id === "Status");
    if (!statusCol || !statusCol.value) return undefined;
    if (Array.isArray(statusCol.value)) {
      return (statusCol.value[0] as Status) || undefined;
    }
    return (statusCol.value as Status) || undefined;
  }, [columnFilters]);

  const { data, isLoading, isFetching } = useDrivers({
    page,
    limit: pageSize,
    search: search || undefined,
    approvalStatus: selectedStatus,
  });

  const bulkDeleteMutation = useBulkDelete();

  const handleBulkDelete = async (selectedRows: Driver[]) => {
    const ids = selectedRows.map((row) => row.id);
    if (!ids.length) return;
    await bulkDeleteMutation.mutateAsync(ids);
  };

  const columns = useMemo(
    () =>
      getColumns({
        onView: (item) => router.push(`/drivers/profile/${item.id}`),
      }),
    [router],
  );

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[{ label: "Home", href: "/analytics" }, { label: "Driver" }, { label: "Drivers" }]}
      />

      <Card className="shadow-xs border border-border bg-card">
        <CardContent className="p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-default-900">Driver Applications</h2>
            <p className="text-xs text-default-500 mt-1">
              Overview and management of driver registration applications.
            </p>
          </div>

          <DataTable
            columns={columns}
            data={data?.data ?? []}
            searchKey="App No #"
            searchValue={search}
            onSearchChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            searchPlaceholder="Search by app #, name, email..."
            filterColumns={filter}
            columnFilters={columnFilters}
            onColumnFiltersChange={(updater) => {
              setColumnFilters(updater);
              setPage(1);
            }}
            manualFiltering={true}
            loading={isLoading}
            fetching={isFetching}
            onBulkDelete={handleBulkDelete}
            isDeleting={bulkDeleteMutation.isPending}
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
