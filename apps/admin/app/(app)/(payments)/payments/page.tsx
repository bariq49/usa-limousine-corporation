"use client";

import { useMemo, useState } from "react";
import { Breadcrumbs } from "@usa-limousine-corporation/ui/layout/breadcrumbs";
import { Card, CardContent } from "@usa-limousine-corporation/ui/components/card";
import {
  DataTable,
  type ColumnFiltersState,
} from "@usa-limousine-corporation/ui/components/data-table/data-table";
import { filter, getColumns } from "@/components/columns/payment-columns";
import { RefundPaymentModal } from "@/components/modals/refund-payment-modal";
import { usePayments } from "@/hooks/queries/use-payments";
import type { Payment, PaymentMode, PaymentStatus } from "@/lib/types/payments";

export default function PaymentsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [refundPayment, setRefundPayment] = useState<Payment | null>(null);

  const filterValue = (id: string) => {
    const value = columnFilters.find((f) => f.id.toLowerCase() === id.toLowerCase())?.value;
    return (Array.isArray(value) ? value[0] : value) as string | undefined;
  };

  const status = filterValue("status") as PaymentStatus | undefined;
  const mode = filterValue("mode") as PaymentMode | undefined;

  const { data, isLoading, isFetching, refetch } = usePayments({
    page,
    limit: pageSize,
    search: search || undefined,
    status: status || undefined,
    mode: mode || undefined,
  });

  const columns = useMemo(
    () =>
      getColumns({
        onRefund: (item) => setRefundPayment(item),
      }),
    [],
  );

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: "Home", href: "/analytics" }, { label: "Payment History" }]} />

      <Card className="shadow-xs border border-border bg-card">
        <CardContent className="p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-default-900">Payment History</h2>
            <p className="text-xs text-default-500 mt-1">
              View customer transactions, payment methods, and original charges.
            </p>
          </div>

          <DataTable
            columns={columns}
            data={data?.data ?? []}
            searchKey="transactionId"
            searchValue={search}
            onSearchChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            searchPlaceholder="Search by transaction ID, customer, or booking..."
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

      <RefundPaymentModal
        open={Boolean(refundPayment)}
        onOpenChange={(open) => {
          if (!open) setRefundPayment(null);
        }}
        payment={refundPayment}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
