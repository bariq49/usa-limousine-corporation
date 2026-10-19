"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Breadcrumbs } from "@usa-limousine-corporation/ui/layout/breadcrumbs";
import { Card, CardContent } from "@usa-limousine-corporation/ui/components/card";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import {
  DataTable,
  type ColumnFiltersState,
} from "@usa-limousine-corporation/ui/data-table/data-table";
import {
  useCategories,
  useDeleteCategory,
  useBulkDeleteCategories,
} from "@/hooks/queries/use-vehicle-categories";
import type { Item } from "@/lib/types/vehicle-categories";
import { getColumns, filter } from "@/components/columns/category-columns";

export default function VehicleCategoriesPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const selectedStatus = useMemo(() => {
    const statusCol = columnFilters.find((f) => f.id === "Status");
    if (!statusCol || statusCol.value === undefined) return undefined;
    const val = Array.isArray(statusCol.value) ? statusCol.value[0] : statusCol.value;
    if (val === "true") return true;
    if (val === "false") return false;
    return undefined;
  }, [columnFilters]);

  const { data, isLoading, isFetching } = useCategories({
    page,
    limit: pageSize,
    search: search || undefined,
    isActive: selectedStatus,
  });

  const deleteMutation = useDeleteCategory();
  const bulkDeleteMutation = useBulkDeleteCategories();

  const handleBulkDelete = async (selectedRows: Item[]) => {
    const ids = selectedRows.map((row) => row.id);
    if (!ids.length) return;
    await bulkDeleteMutation.mutateAsync(ids);
  };

  const handleDelete = async (item: Item) => {
    await deleteMutation.mutateAsync(item.id);
  };

  const handleEdit = (item: Item) => {
    router.push(`/categories/${item.id}/edit`);
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
        items={[
          { label: "Home", href: "/analytics" },
          { label: "Vehicle" },
          { label: "Categories" },
        ]}
      />

      <Card className="shadow-xs border border-border bg-card">
        <CardContent className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-default-900">Vehicle Categories</h2>
              <p className="text-xs text-default-500 mt-1">
                Overview and management of vehicle categories and capacities.
              </p>
            </div>
            <Button size="sm" className="gap-2" asChild>
              <Link href="/categories/new">
                <Plus className="h-4 w-4" />
                <span>Add Category</span>
              </Link>
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
            searchPlaceholder="Search by category name..."
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
