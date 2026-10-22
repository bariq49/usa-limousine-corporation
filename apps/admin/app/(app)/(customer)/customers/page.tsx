"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Breadcrumbs } from "@usa-limousine-corporation/ui/layout/breadcrumbs";
import { Card, CardContent } from "@usa-limousine-corporation/ui/components/card";
import {
  DataTable,
  type ColumnFiltersState,
} from "@usa-limousine-corporation/ui/data-table/data-table";
import { filter, getColumns } from "@/components/columns/customer-columns";
import { useCustomers } from "@/hooks/queries/use-customers";
import type { CustomerType } from "@/lib/types/customers";

export default function CustomersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const typeFilter = columnFilters.find((f) => f.id === "Type")?.value;
  const type = (Array.isArray(typeFilter) ? typeFilter[0] : typeFilter) as CustomerType | undefined;

  const { data, isLoading, isFetching } = useCustomers({
    page,
    limit: pageSize,
    search: search || undefined,
    type: type || undefined,
  });

  const columns = useMemo(
    () => getColumns({ onView: (item) => router.push(`/customers/${item.id}`) }),
    [router],
  );

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/analytics" },
          { label: "Customer" },
          { label: "Customers" },
        ]}
      />

      <Card className="border border-border bg-card shadow-xs">
        <CardContent className="p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-default-900">Customers</h2>
            <p className="mt-1 text-xs text-default-500">
              Everyone registered on the customer portal. Open a customer to see their bookings and
              tickets.
            </p>
          </div>

          <DataTable
            columns={columns}
            data={data?.data ?? []}
            searchKey="Customer"
            searchValue={search}
            onSearchChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            searchPlaceholder="Search by name, email or phone..."
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
