"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Breadcrumbs } from "@usa-limousine-corporation/ui/layout/breadcrumbs";
import { Card, CardContent } from "@usa-limousine-corporation/ui/components/card";
import {
  DataTable,
  type ColumnFiltersState,
} from "@usa-limousine-corporation/ui/data-table/data-table";
import { useBulkDeleteTickets, useDeleteTicket, useTickets } from "@/hooks/queries/use-tickets";
import type {
  OwnerType,
  Ticket,
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from "@/lib/types/tickets";
import { getColumns, filter } from "@/components/columns/ticket-columns";

function filterValue<T extends string>(
  columnFilters: ColumnFiltersState,
  id: string,
): T | undefined {
  const col = columnFilters.find((f) => f.id === id);
  if (!col || !col.value) return undefined;
  if (Array.isArray(col.value)) {
    return (col.value[0] as T) || undefined;
  }
  return col.value as T;
}

export default function HelpCenterPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const ownerType = filterValue<OwnerType>(columnFilters, "Owner Type");
  const status = filterValue<TicketStatus>(columnFilters, "Status");
  const priority = filterValue<TicketPriority>(columnFilters, "Priority");
  const category = filterValue<TicketCategory>(columnFilters, "Category");

  const { data, isLoading, isFetching } = useTickets({
    page,
    limit: pageSize,
    search: search || undefined,
    ownerType,
    status,
    priority,
    category,
  });

  const deleteMutation = useDeleteTicket();
  const bulkDeleteMutation = useBulkDeleteTickets();

  const handleBulkDelete = async (selectedRows: Ticket[]) => {
    const ids = selectedRows.map((row) => row.id);
    if (!ids.length) return;
    await bulkDeleteMutation.mutateAsync(ids);
  };

  const handleDelete = async (item: Ticket) => {
    await deleteMutation.mutateAsync(item.id);
  };

  const columns = useMemo(
    () =>
      getColumns({
        onView: (item) => router.push(`/help-center/${item.id}`),
        onDelete: handleDelete,
      }),
    [router, deleteMutation],
  );

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/analytics" },
          { label: "Help Center" },
          { label: "Tickets" },
        ]}
      />

      <Card className="shadow-xs border border-border bg-card">
        <CardContent className="p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-default-900">Help Center</h2>
            <p className="text-xs text-default-500 mt-1">
              Review driver and customer support tickets. Open a ticket to reply or update status.
            </p>
          </div>

          <DataTable
            columns={columns}
            data={data?.data ?? []}
            searchKey="Ticket"
            searchValue={search}
            onSearchChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            searchPlaceholder="Search by ticket # or subject..."
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
