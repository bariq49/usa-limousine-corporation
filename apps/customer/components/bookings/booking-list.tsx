"use client";

import { useMemo, useState } from "react";
import { Breadcrumbs } from "@usa-limousine-corporation/ui/layout/breadcrumbs";
import { Card, CardContent } from "@usa-limousine-corporation/ui/components/card";
import {
  DataTable,
  type ColumnFiltersState,
} from "@usa-limousine-corporation/ui/components/data-table/data-table";
import { filter, getColumns } from "@usa-limousine-corporation/ui/components/bookings/booking-columns";
import type { BookingStatus } from "@usa-limousine-corporation/ui/types/booking-model";
import { useBookings } from "@/hooks/queries/use-bookings";

type Props = {
  title: string;
  description: string;
  status?: BookingStatus | undefined;
};

export function BookingList({ title, description, status }: Props) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const statusFilter = columnFilters.find((f) => f.id === "Status")?.value;
  const filteredStatus = (Array.isArray(statusFilter) ? statusFilter[0] : statusFilter) as
    BookingStatus | undefined;

  const { data, isLoading, isFetching } = useBookings({
    page,
    limit: pageSize,
    search: search || undefined,
    status: status ?? (filteredStatus || undefined),
  });

  const columns = useMemo(() => getColumns({ basePath: "/bookings" }), []);

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[{ label: "Home", href: "/dashboard" }, { label: "Booking" }, { label: title }]}
      />

      <Card className="border border-border bg-card shadow-xs">
        <CardContent className="p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-default-900">{title}</h2>
            <p className="mt-1 text-xs text-default-500">{description}</p>
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
            filterColumns={status ? undefined : filter}
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
