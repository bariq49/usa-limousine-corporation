"use client";

import Link from "next/link";
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
import { getColumns } from "@/components/columns/blog-columns";
import { useBlogs, useDeleteBlog, useTaxonomies } from "@/hooks/queries/use-blogs";
import type { Blog } from "@/lib/types/blogs";

export default function DraftBlogsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [deleting, setDeleting] = useState<Blog | null>(null);
  const deleteMutation = useDeleteBlog();
  const { data: categories } = useTaxonomies("category", { limit: 100 });

  const categoryFilter = columnFilters.find((item) => item.id === "Category")?.value;
  const categoryId = (Array.isArray(categoryFilter) ? categoryFilter[0] : categoryFilter) as
    | string
    | undefined;

  const { data, isLoading, isFetching } = useBlogs({
    page,
    limit: pageSize,
    search: search || undefined,
    status: "DRAFT",
    categoryId,
  });

  const columns = useMemo(() => getColumns({ onDelete: setDeleting }), []);
  const filterColumns: DataTableFilterColumn[] = useMemo(
    () => [
      {
        column: "Category",
        title: "Category",
        multiple: false,
        options: (categories?.data ?? []).map((item) => ({ value: item.id, label: item.name })),
      },
    ],
    [categories],
  );

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/analytics" },
          { label: "Blog", href: "/blogs" },
          { label: "Drafts" },
        ]}
      />

      <Card className="border border-border bg-card shadow-xs">
        <CardContent className="p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-default-900">Drafts</h2>
              <p className="mt-1 text-xs text-default-500">
                Articles that are still being written and are not visible on the website.
              </p>
            </div>
            <Button asChild size="sm" className="gap-2">
              <Link href="/blogs/create">
                <Plus className="h-4 w-4" />
                <span>New Article</span>
              </Link>
            </Button>
          </div>

          <DataTable
            columns={columns}
            data={data?.data ?? []}
            searchKey="Article"
            searchValue={search}
            onSearchChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            searchPlaceholder="Search articles..."
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

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        title="Delete article?"
        description={
          deleting ? `"${deleting.title}" and its comments will be removed for good.` : ""
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
