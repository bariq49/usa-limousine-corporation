"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@usa-limousine-corporation/ui/components/card";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { DataTable, type ColumnFiltersState } from "@usa-limousine-corporation/ui/data-table/data-table";
import { Plus } from "lucide-react";
import {
  useHourlyPricings,
  useDeleteHourlyPricing,
  useBulkDeleteHourlyPricings,
} from "@/hooks/queries/use-hourly-pricing";
import { useCategories } from "@/hooks/queries/use-vehicle-categories";
import type { Item, Status } from "@/lib/types/hourly-pricing";
import { getColumns, getFilters } from "@/components/columns/hourly-pricing-columns";
import { HourlyPricingModal } from "@/components/modals/hourly-pricing-modal";

const getFilterValue = (filters: ColumnFiltersState, id: string) => {
  const col = filters.find((f) => f.id === id);
  if (!col || col.value === undefined) return undefined;
  const val = Array.isArray(col.value) ? col.value[0] : col.value;
  return (val as string) || undefined;
};

export function HourlyPricing() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  const { data: categoriesData } = useCategories({
    limit: 100,
  });

  const filters = useMemo(() => {
    return getFilters(
      (categoriesData?.data ?? []).map((cat) => ({
        label: cat.name,
        value: cat.id,
      })),
    );
  }, [categoriesData]);

  const { data, isLoading, isFetching } = useHourlyPricings({
    page,
    limit: pageSize,
    search: search || undefined,
    vehicleCategoryId: getFilterValue(columnFilters, "vehicleCategory"),
    status: getFilterValue(columnFilters, "Status") as Status | undefined,
  });

  const deleteMutation = useDeleteHourlyPricing();
  const bulkDeleteMutation = useBulkDeleteHourlyPricings();

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

  const columns = useMemo(
    () =>
      getColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
      }),
    [deleteMutation],
  );

  return (
    <>
      <Card className="shadow-xs border border-border bg-card">
        <CardContent className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-default-900">
                Hourly Pricing
              </h2>
              <p className="text-xs text-default-500 mt-1">
                Overview and management of hourly pricing per vehicle category.
              </p>
            </div>
            <Button size="sm" className="gap-2" onClick={handleAdd}>
              <Plus className="h-4 w-4" />
              <span>Add Hourly Pricing</span>
            </Button>
          </div>

          <DataTable
            columns={columns}
            data={data?.data ?? []}
            searchKey="vehicleCategory"
            searchValue={search}
            onSearchChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            searchPlaceholder="Search hourly pricing..."
            filterColumns={filters}
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

      <HourlyPricingModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initialData={editingItem}
        onSuccess={() => setEditingItem(null)}
      />
    </>
  );
}
