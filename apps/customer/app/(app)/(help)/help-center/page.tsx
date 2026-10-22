"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Breadcrumbs } from "@usa-limousine-corporation/ui/layout/breadcrumbs";
import { Card, CardContent } from "@usa-limousine-corporation/ui/components/card";
import {
  DataTable,
  type ColumnFiltersState,
} from "@usa-limousine-corporation/ui/data-table/data-table";
import { filter, getColumns } from "@/components/columns/ticket-columns";
import { NewTicketDialog } from "@/components/help-center/new-ticket-dialog";
import { useTickets } from "@/hooks/queries/use-tickets";
import type { TicketCategory, TicketPriority, TicketStatus } from "@/lib/api/types";

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
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const { data, isLoading, isFetching } = useTickets({
    page,
    limit: pageSize,
    search: search || undefined,
    status: filterValue<TicketStatus>(columnFilters, "Status"),
    priority: filterValue<TicketPriority>(columnFilters, "Priority"),
    category: filterValue<TicketCategory>(columnFilters, "Category"),
  });

  const columns = useMemo(
    () => getColumns({ onView: (item) => router.push(`/help-center/${item.id}`) }),
    [router],
  );

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/dashboard" },
          { label: "Settings" },
          { label: "Help Center" },
        ]}
      />

      <Card className="border border-border bg-card shadow-xs">
        <CardContent className="p-6">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-default-900">Help Center</h2>
              <p className="mt-1 text-xs text-default-500">
                Create a support ticket and follow the conversation with our team.
              </p>
            </div>
            <NewTicketDialog onCreated={(id) => router.push(`/help-center/${id}`)} />
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
