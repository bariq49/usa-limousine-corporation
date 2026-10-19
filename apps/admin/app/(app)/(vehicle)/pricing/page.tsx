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
import {
  useVehiclePricings,
  useDeleteVehiclePricing,
  useBulkDeleteVehiclePricings,
} from "@/hooks/queries/use-vehicle-pricing";
import { useCategories } from "@/hooks/queries/use-vehicle-categories";
import type { Item, Status, Type } from "@/lib/types/vehicle-pricing";
import { getColumns, getFilters } from "@/components/columns/vehicle-pricing-columns";
import { PricingModal } from "@/components/modals/pricing-modal";

export default function VehiclePricingPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  const { data: categoriesData } = useCategories({
    limit: 100,
  });

  const categoryFilterOptions = useMemo(() => {
    return (categoriesData?.data ?? []).map((cat) => ({
      label: cat.name,
      value: cat.id,
    }));
  }, [categoriesData]);

  const filters = useMemo(() => {
    return getFilters(categoryFilterOptions);
  }, [categoryFilterOptions]);

  const selectedCategory = useMemo(() => {
    const catCol = columnFilters.find((f) => f.id === "vehicleCategory");
    if (!catCol || catCol.value === undefined) return undefined;
    const val = Array.isArray(catCol.value) ? catCol.value[0] : catCol.value;
    return (val as string) || undefined;
  }, [columnFilters]);

  const selectedStatus = useMemo(() => {
    const statusCol = columnFilters.find((f) => f.id === "Status");
    if (!statusCol || statusCol.value === undefined) return undefined;
    const val = Array.isArray(statusCol.value) ? statusCol.value[0] : statusCol.value;
    return (val as Status) || undefined;
  }, [columnFilters]);

  const selectedPricingType = useMemo(() => {
    const typeCol = columnFilters.find((f) => f.id === "pricingType");
    if (!typeCol || typeCol.value === undefined) return undefined;
    const val = Array.isArray(typeCol.value) ? typeCol.value[0] : typeCol.value;
    return (val as Type) || undefined;
  }, [columnFilters]);

  const { data, isLoading, isFetching } = useVehiclePricings({
    page,
    limit: pageSize,
    search: search || undefined,
    vehicleCategoryId: selectedCategory,
    status: selectedStatus,
    pricingType: selectedPricingType,
  });

  const deleteMutation = useDeleteVehiclePricing();
  const bulkDeleteMutation = useBulkDeleteVehiclePricings();

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
    <div className="space-y-4">
      <Breadcrumbs
        items={[{ label: "Home", href: "/analytics" }, { label: "Vehicle" }, { label: "Pricing" }]}
      />

      <Card className="shadow-xs border border-border bg-card">
        <CardContent className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-default-900">Vehicle Pricing</h2>
              <p className="text-xs text-default-500 mt-1">
                Overview and management of distance-based vehicle pricing tiers.
              </p>
            </div>
            <Button size="sm" className="gap-2" onClick={handleAdd}>
              <Plus className="h-4 w-4" />
              <span>Add Pricing</span>
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
            searchPlaceholder="Search pricing..."
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

      <PricingModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initialData={editingItem}
        onSuccess={() => setEditingItem(null)}
      />
    </div>
  );
}
