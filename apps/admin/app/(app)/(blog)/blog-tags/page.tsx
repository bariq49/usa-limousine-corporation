"use client";

import { useMemo, useState } from "react";
import { Breadcrumbs } from "@usa-limousine-corporation/ui/layout/breadcrumbs";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { Card, CardContent } from "@usa-limousine-corporation/ui/components/card";
import { ConfirmDialog } from "@usa-limousine-corporation/ui/components/confirm-dialog";
import {
  DataTable,
  type ColumnFiltersState,
  type DataTableFilterColumn,
} from "@usa-limousine-corporation/ui/components/data-table/data-table";
import { Plus } from "@usa-limousine-corporation/ui/svg";
import { getColumns } from "@/components/columns/blog-taxonomy-columns";
import { BlogTagModal } from "@/components/modals/blog-tag-modal";
import { useDeleteTaxonomy, useTaxonomies } from "@/hooks/queries/use-blogs";
import type { Taxonomy } from "@/lib/types/blogs";

const STATUS_FILTER: DataTableFilterColumn[] = [
  {
    column: "Status",
    title: "Status",
    multiple: false,
    options: [
      { value: "true", label: "Active" },
      { value: "false", label: "Inactive" },
    ],
  },
];

export default function BlogTagsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Taxonomy | null>(null);
  const [deleting, setDeleting] = useState<Taxonomy | null>(null);
  const deleteMutation = useDeleteTaxonomy("tag");

  const statusFilter = columnFilters.find((item) => item.id === "Status")?.value;
  const statusValue = Array.isArray(statusFilter) ? statusFilter[0] : statusFilter;

  const { data, isLoading, isFetching } = useTaxonomies("tag", {
    page,
    limit: pageSize,
    search: search || undefined,
    isActive: statusValue === "true" ? true : statusValue === "false" ? false : undefined,
  });

  const columns = useMemo(
    () =>
      getColumns({
        onEdit: (item) => {
          setEditing(item);
          setModalOpen(true);
        },
        onDelete: setDeleting,
      }),
    [],
  );

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/analytics" },
          { label: "Blog", href: "/blogs" },
          { label: "Blog Tags" },
        ]}
      />

      <Card className="border border-border bg-card shadow-xs">
        <CardContent className="p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-default-900">Blog Tags</h2>
              <p className="mt-1 text-xs text-default-500">
                Short labels that connect related articles across categories.
              </p>
            </div>
            <Button
              size="sm"
              className="gap-2"
              onClick={() => {
                setEditing(null);
                setModalOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              <span>Add Tag</span>
            </Button>
          </div>

          <DataTable
            columns={columns}
            data={data?.data ?? []}
            searchKey="Name"
            searchValue={search}
            onSearchChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            searchPlaceholder="Search blog tags..."
            filterColumns={STATUS_FILTER}
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

      <BlogTagModal open={modalOpen} onOpenChange={setModalOpen} initialData={editing} />


      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        title="Delete tag?"
        description={
          deleting ? `"${deleting.name}" will be removed from every article.` : ""
        }
        confirmLabel="Delete"
        confirmColor="destructive"
        pending={deleteMutation.isPending}
        onConfirm={async () => {
          if (!deleting) return;
          try {
            await deleteMutation.mutateAsync(deleting.id);
            setDeleting(null);
          } catch {
            return;
          }
        }}
      />
    </div>
  );
}
