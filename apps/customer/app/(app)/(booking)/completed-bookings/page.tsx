"use client";

import { useMemo, useState } from "react";
import { Breadcrumbs } from "@usa-limousine-corporation/ui/layout/breadcrumbs";
import { Card, CardContent } from "@usa-limousine-corporation/ui/components/card";
import { DataTable } from "@usa-limousine-corporation/ui/components/data-table/data-table";
import { getColumns } from "@usa-limousine-corporation/ui/components/bookings/booking-columns";
import { useBookings } from "@/hooks/queries/use-bookings";

export default function CompletedBookingsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");

  const { data, isLoading, isFetching } = useBookings({
    page,
    limit: pageSize,
    search: search || undefined,
    status: "COMPLETED",
  });

  const columns = useMemo(() => getColumns({ basePath: "/bookings" }), []);

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/dashboard" },
          { label: "Booking" },
          { label: "Completed Bookings" },
        ]}
      />

      <Card className="border border-border bg-card shadow-xs">
        <CardContent className="p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-default-900">Completed Bookings</h2>
            <p className="mt-1 text-xs text-default-500">Rides you have completed.</p>
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
