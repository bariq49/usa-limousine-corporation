"use client";

import { useCallback, useMemo, useState } from "react";
import { Breadcrumbs } from "@usa-limousine-corporation/ui/layout/breadcrumbs";
import { Card, CardContent } from "@usa-limousine-corporation/ui/components/card";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { ConfirmDialog } from "@usa-limousine-corporation/ui/components/confirm-dialog";
import {
  DataTable,
  type ColumnFiltersState,
} from "@usa-limousine-corporation/ui/data-table/data-table";
import { Plus } from "lucide-react";
import { driverName, filter, getColumns } from "@/components/columns/driver-columns";
import { DriverModal } from "@/components/modals/driver-modal";
import { useDeleteDriver, useDrivers } from "@/hooks/queries/use-drivers";
import { useCategories } from "@/hooks/queries/use-vehicle-categories";
import type { Driver, DriverStatus } from "@/lib/types/drivers";

export default function DriversPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Driver | null>(null);
  const [deletingItem, setDeletingItem] = useState<Driver | null>(null);

  const filterValue = (id: string) => {
    const value = columnFilters.find((f) => f.id === id)?.value;
    return (Array.isArray(value) ? value[0] : value) as string | undefined;
  };

  const { data, isLoading, isFetching } = useDrivers({
    page,
    limit: pageSize,
    search: search || undefined,
    status: filterValue("Status") as DriverStatus | undefined,
    vehicleCategoryId: filterValue("Vehicle"),
  });
  const { data: categoriesData } = useCategories({ limit: 100 });
  const deleteMutation = useDeleteDriver();

  const handleEdit = useCallback((item: Driver) => {
    setEditingItem(item);
    setModalOpen(true);
  }, []);

  const columns = useMemo(
    () => getColumns({ onEdit: handleEdit, onDelete: setDeletingItem }),
    [handleEdit],
  );

  const filterColumns = useMemo(
    () =>
      filter(
        (categoriesData?.data ?? []).map((category) => ({
          value: category.id,
          label: category.name,
        })),
      ),
    [categoriesData],
  );

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[{ label: "Home", href: "/analytics" }, { label: "Driver" }, { label: "Drivers" }]}
      />

      <Card className="border border-border bg-card shadow-xs">
        <CardContent className="p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-default-900">Drivers</h2>
              <p className="mt-1 text-xs text-default-500">
                Register chauffeurs, manage their vehicle category and open a profile to see rides
                and earnings.
              </p>
            </div>
            <Button
              size="sm"
              className="gap-2"
              onClick={() => {
                setEditingItem(null);
                setModalOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              <span>Register Driver</span>
            </Button>
          </div>

          <DataTable
            columns={columns}
            data={data?.data ?? []}
            searchKey="Driver"
            searchValue={search}
            onSearchChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            searchPlaceholder="Search by name, email or phone..."
            filterColumns={filterColumns}
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

      <DriverModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initialData={editingItem}
        onSuccess={() => setEditingItem(null)}
      />

      <ConfirmDialog
        open={Boolean(deletingItem)}
        onOpenChange={(open) => {
          if (!open) setDeletingItem(null);
        }}
        title="Delete driver?"
        description={
          deletingItem
            ? `${driverName(deletingItem)} will no longer be available for assignments. Past rides stay in the records.`
            : ""
        }
        confirmLabel="Delete"
        confirmColor="destructive"
        pending={deleteMutation.isPending}
        onConfirm={async () => {
          if (!deletingItem) return;
          try {
            await deleteMutation.mutateAsync(deletingItem.id);
            setDeletingItem(null);
          } catch {
            return;
          }
        }}
      />
    </div>
  );
}
