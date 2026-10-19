"use client";

import { useMemo, useState } from "react";
import { Breadcrumbs } from "@usa-limousine-corporation/ui/layout/breadcrumbs";
import { Card, CardContent } from "@usa-limousine-corporation/ui/components/card";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import {
  DataTable,
  type ColumnFiltersState,
} from "@usa-limousine-corporation/ui/data-table/data-table";
import { Plus } from "lucide-react";
import { useLuggage, useDeleteLuggage, useBulkDeleteLuggage } from "@/hooks/queries/use-luggage";
import type { Item } from "@/lib/types/luggage";
import { getColumns, statusFilter } from "@/components/columns/luggage-columns";
import { LuggageModal } from "@/components/modals/luggage-modal";

export default function SpecialLuggagePage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  const selectedStatus = useMemo(() => {
    const statusCol = columnFilters.find((f) => f.id === "Status");
    if (!statusCol || statusCol.value === undefined) return undefined;
    const val = Array.isArray(statusCol.value) ? statusCol.value[0] : statusCol.value;
    if (val === "true") return true;
    if (val === "false") return false;
    return undefined;
  }, [columnFilters]);

  const { data, isLoading, isFetching } = useLuggage({
    page,
    limit: pageSize,
    search: search || undefined,
    isSpecial: true,
    isActive: selectedStatus,
  });

  const deleteMutation = useDeleteLuggage();
  const bulkDeleteMutation = useBulkDeleteLuggage();

  const handleBulkDelete = async (selectedRows: Item[]) => {
    const ids = selectedRows.map((row) => row.id);
    if (!ids.length) return;
    await bulkDeleteMutation.mutateAsync(ids);
  };

  const handleDelete = async (item: Item) => {
    await deleteMutation.mutateAsync(item.id);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const isDeleting = bulkDeleteMutation.isPending || deleteMutation.isPending;

  const columns = useMemo(
    () =>
      getColumns({
        onDelete: handleDelete,
        onEdit: handleEdit,
      }),
    [handleDelete, handleEdit],
  );

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/analytics" },
          { label: "Vehicle" },
          { label: "Special Luggage" },
        ]}
      />

      <Card className="shadow-xs border border-border bg-card">
        <CardContent className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-default-900">Special Luggage</h2>
              <p className="text-xs text-default-500 mt-1">
                Overview and management of special equipment and oversized items (e.g. bicycles,
                strollers, wheelchairs, ski equipment).
              </p>
            </div>
            <Button size="sm" className="gap-2" onClick={handleAdd}>
              <Plus className="h-4 w-4" />
              <span>Add Luggage</span>
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
            searchPlaceholder="Search special luggage..."
            filterColumns={statusFilter}
            columnFilters={columnFilters}
            onColumnFiltersChange={(updater) => {
              setColumnFilters(updater);
              setPage(1);
            }}
            manualFiltering={true}
            loading={isLoading}
            fetching={isFetching}
            onBulkDelete={handleBulkDelete}
            isDeleting={isDeleting}
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

      <LuggageModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        isSpecial={true}
        initialData={editingItem}
        onSuccess={() => setEditingItem(null)}
      />
    </div>
  );
}
