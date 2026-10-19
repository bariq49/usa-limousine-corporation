"use client";

import { useMemo, useState } from "react";
import { Breadcrumbs } from "@usa-limousine-corporation/ui/layout/breadcrumbs";
import { Card, CardContent } from "@usa-limousine-corporation/ui/components/card";
import { DataTable } from "@usa-limousine-corporation/ui/data-table/data-table";
import { useVehicles, useDeleteVehicle, useBulkDeleteVehicles } from "@/hooks/queries/use-vehicles";
import type { Item } from "@/lib/types/vehicles";
import { getColumns, filter } from "@/components/columns/vehicle-columns";

export default function VehiclesPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");

  const { data, isLoading, isFetching } = useVehicles({
    page,
    limit: pageSize,
    search: search || undefined,
  });

  const deleteMutation = useDeleteVehicle();
  const bulkDeleteMutation = useBulkDeleteVehicles();

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
        items={[{ label: "Home", href: "/analytics" }, { label: "Vehicle" }, { label: "Vehicles" }]}
      />

      <Card className="shadow-xs border border-border bg-card">
        <CardContent className="p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-default-900">Vehicles</h2>
            <p className="text-xs text-default-500 mt-1">
              Overview and management of registered driver vehicles.
            </p>
          </div>

          <DataTable
            columns={columns}
            data={data?.data ?? []}
            searchKey="make"
            searchValue={search}
            onSearchChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            searchPlaceholder="Search by make, model, license plate..."
            filterColumns={filter}
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
