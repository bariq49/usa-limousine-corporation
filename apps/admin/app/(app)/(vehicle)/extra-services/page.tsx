"use client";

import { useCallback, useMemo, useState } from "react";
import { Breadcrumbs } from "@usa-limousine-corporation/ui/layout/breadcrumbs";
import { Card, CardContent } from "@usa-limousine-corporation/ui/components/card";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import {
  DataTable,
  type ColumnFiltersState,
} from "@usa-limousine-corporation/ui/data-table/data-table";
import { Plus } from "lucide-react";
import { useBulkDeleteServices, useDeleteService, useServices } from "@/hooks/queries/use-services";
import type { ExtraServiceType, Item } from "@/lib/types/services";
import { getColumns, filter } from "@/components/columns/service-columns";
import { ServiceModal } from "@/components/modals/service-modal";

export default function ServicesPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  const selectedType = useMemo(() => {
    const typeCol = columnFilters.find((f) => f.id === "Type");
    if (!typeCol || typeCol.value === undefined) return undefined;
    const val = Array.isArray(typeCol.value) ? typeCol.value[0] : typeCol.value;
    return val as ExtraServiceType | undefined;
  }, [columnFilters]);

  const selectedStatus = useMemo(() => {
    const statusCol = columnFilters.find((f) => f.id === "Status");
    if (!statusCol || statusCol.value === undefined) return undefined;
    const val = Array.isArray(statusCol.value) ? statusCol.value[0] : statusCol.value;
    if (val === "true") return true;
    if (val === "false") return false;
    return undefined;
  }, [columnFilters]);

  const { data, isLoading, isFetching } = useServices({
    page,
    limit: pageSize,
    search: search || undefined,
    type: selectedType,
    isActive: selectedStatus,
  });

  const deleteMutation = useDeleteService();
  const bulkDeleteMutation = useBulkDeleteServices();

  const handleBulkDelete = async (selectedRows: Item[]) => {
    const ids = selectedRows.map((row) => row.id);
    if (!ids.length) return;
    await bulkDeleteMutation.mutateAsync(ids);
  };

  const handleDelete = useCallback(
    async (item: Item) => {
      await deleteMutation.mutateAsync(item.id);
    },
    [deleteMutation],
  );

  const handleEdit = useCallback((item: Item) => {
    setEditingItem(item);
    setModalOpen(true);
  }, []);

  const handleAdd = useCallback(() => {
    setEditingItem(null);
    setModalOpen(true);
  }, []);

  const columns = useMemo(
    () =>
      getColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
      }),
    [handleDelete, handleEdit],
  );

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/analytics" },
          { label: "Vehicle", href: "/vehicles" },
          { label: "Extra Services" },
        ]}
      />

      <Card className="shadow-xs border border-border bg-card">
        <CardContent className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-default-900">Extra Services</h2>
              <p className="text-xs text-default-500 mt-1">
                Manage extra services, child safety seats, and Meet &amp; Greet pricing.
              </p>
            </div>
            <Button size="sm" className="gap-2" onClick={handleAdd}>
              <Plus className="h-4 w-4" />
              <span>Add Service</span>
            </Button>
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
            searchPlaceholder="Search extra services..."
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

      <ServiceModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initialData={editingItem}
        onSuccess={() => setEditingItem(null)}
      />
    </div>
  );
}
