"use client";

import { useMemo, useState } from "react";
import { Breadcrumbs } from "@usa-limousine-corporation/ui/layout/breadcrumbs";
import { Card, CardContent } from "@usa-limousine-corporation/ui/components/card";
import {
  DataTable,
  type ColumnFiltersState,
} from "@usa-limousine-corporation/ui/data-table/data-table";
import { useBookings, useDeleteBooking, useBulkDeleteBookings } from "@/hooks/queries/use-bookings";
import type { BookingStatus, Item } from "@/lib/types/bookings";
import { filter, getColumns } from "@usa-limousine-corporation/ui/bookings/booking-columns";

export default function AllBookingsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const statusFilter = columnFilters.find((f) => f.id === "Status")?.value;
  const status = (Array.isArray(statusFilter) ? statusFilter[0] : statusFilter) as
    BookingStatus | undefined;

  const { data, isLoading, isFetching } = useBookings({
    page,
    limit: pageSize,
    search: search || undefined,
    status: status || undefined,
  });

  const deleteMutation = useDeleteBooking();
  const bulkDeleteMutation = useBulkDeleteBookings();

  const handleBulkDelete = async (selectedRows: Item[]) => {
    const ids = selectedRows.map((row) => row.id);
    if (!ids.length) return;
    await bulkDeleteMutation.mutateAsync(ids);
  };

  const handleDelete = async (item: Item) => {
    await deleteMutation.mutateAsync(item.id);
  };

  const columns = useMemo(
    () =>
      getColumns({
        onDelete: handleDelete,
      }),
    [deleteMutation],
  );

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/analytics" },
          { label: "Booking" },
          { label: "All Bookings" },
        ]}
      />

      <Card className="shadow-xs border border-border bg-card">
        <CardContent className="p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-default-900">All Bookings</h2>
            <p className="text-xs text-default-500 mt-1">
              Every booking across all statuses. Filter by status or search by booking number.
            </p>
          </div>

          <DataTable
            columns={columns}
            data={data?.data ?? []}
            searchKey="bookingNumber"
            searchValue={search}
            onSearchChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            searchPlaceholder="Search by booking number..."
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
            isDeleting={bulkDeleteMutation.isPending || deleteMutation.isPending}
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
