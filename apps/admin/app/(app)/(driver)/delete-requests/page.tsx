"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Breadcrumbs } from "@usa-limousine-corporation/ui/layout/breadcrumbs";
import { Card, CardContent } from "@usa-limousine-corporation/ui/components/card";
import {
  DataTable,
  type ColumnFiltersState,
} from "@usa-limousine-corporation/ui/data-table/data-table";
import { useDeleteRequests } from "@/hooks/queries/use-delete-requests";
import type { DeleteRequestStatus } from "@/lib/types/delete-requests";
import { getColumns, filter } from "@/components/columns/delete-request-columns";

export default function DeleteRequestsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const selectedStatus = useMemo(() => {
    const statusCol = columnFilters.find((f) => f.id === "Status");
    if (!statusCol || !statusCol.value) return undefined;
    if (Array.isArray(statusCol.value)) {
      return (statusCol.value[0] as DeleteRequestStatus) || undefined;
    }
    return (statusCol.value as DeleteRequestStatus) || undefined;
  }, [columnFilters]);

  const { data, isLoading, isFetching } = useDeleteRequests({
    page,
    limit: pageSize,
    search: search || undefined,
    status: selectedStatus,
  });

  const columns = useMemo(
    () =>
      getColumns({
        onView: (item) => router.push(`/drivers/profile/${item.driver.id}`),
      }),
    [router],
  );

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/analytics" },
          { label: "Driver" },
          { label: "Delete Requests" },
        ]}
      />

      <Card className="shadow-xs border border-border bg-card">
        <CardContent className="p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-default-900">Delete Requests</h2>
            <p className="text-xs text-default-500 mt-1">
              Review driver account delete requests. Open a profile to approve or reject.
            </p>
          </div>

          <DataTable
            columns={columns}
            data={data?.data ?? []}
            searchKey="name"
            searchValue={search}
            onSearchChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            searchPlaceholder="Search by name, email, app #..."
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
