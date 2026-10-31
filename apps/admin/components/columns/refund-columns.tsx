"use client";

import Link from "next/link";
import type {
  ColumnDef,
  DataTableFilterColumn,
} from "@usa-limousine-corporation/ui/components/data-table/data-table";
import { DataTableColumnHeader } from "@usa-limousine-corporation/ui/components/data-table/data-table-column-header";
import { Badge } from "@usa-limousine-corporation/ui/components/badge";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { formatDate } from "@usa-limousine-corporation/ui/utils/date";
import type { Refund, RefundStatus } from "@/lib/types/payments";

export const REFUND_STATUS_LABELS: Record<RefundStatus, string> = {
  PENDING: "Pending",
  COMPLETED: "Completed",
  REJECTED: "Rejected",
  FAILED: "Failed",
};

export const getColumns = (options: {
  onComplete: (item: Refund) => void;
  onReject: (item: Refund) => void;
}): ColumnDef<Refund>[] => [
  {
    id: "Refund",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Refund ID" />,
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex flex-col">
          <span className="font-mono text-xs font-semibold text-default-900">
            {item.squareRefundId || item.id}
          </span>
          <span className="text-xs text-default-500">
            {item.createdAt ? formatDate({ date: item.createdAt }) : "—"}
          </span>
        </div>
      );
    },
    enableSorting: false,
  },
  {
    id: "Booking",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Booking" />,
    cell: ({ row }) => {
      const item = row.original;
      const bookingNumber = item.booking?.bookingNumber || item.bookingId;
      return (
        <Link
          href={`/bookings/${item.bookingId}`}
          className="font-medium text-xs text-primary hover:underline"
        >
          {bookingNumber}
        </Link>
      );
    },
    enableSorting: false,
  },
  {
    id: "Customer",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" />,
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex flex-col">
          <span className="text-xs font-medium text-default-900">
            {item.payment?.customerName || "—"}
          </span>
          <span className="text-xs text-default-500">{item.payment?.customerEmail || ""}</span>
        </div>
      );
    },
    enableSorting: false,
  },
  {
    id: "Amount",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
    cell: ({ row }) => {
      const item = row.original;
      return <span className="text-xs font-semibold text-warning">${item.amount.toFixed(2)}</span>;
    },
    enableSorting: true,
  },
  {
    id: "Status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.original.status;
      if (status === "COMPLETED") {
        return (
          <Badge variant="soft" color="success">
            Completed
          </Badge>
        );
      }
      if (status === "PENDING") {
        return (
          <Badge variant="soft" color="warning">
            Pending
          </Badge>
        );
      }
      return (
        <Badge variant="soft" color="destructive">
          {REFUND_STATUS_LABELS[status]}
        </Badge>
      );
    },
    enableSorting: false,
  },
  {
    id: "Reason",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Reason" />,
    cell: ({ row }) => {
      const reason = row.original.reason;
      return (
        <span className="text-xs text-default-600 line-clamp-1 max-w-[200px]" title={reason || ""}>
          {reason || "—"}
        </span>
      );
    },
    enableSorting: false,
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const item = row.original;
      if (item.status === "PENDING") {
        return (
          <div className="flex items-center justify-end gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => options.onComplete(item)}
            >
              Process
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => options.onReject(item)}
            >
              Reject
            </Button>
          </div>
        );
      }
      return (
        <div className="text-right text-xs text-default-400">
          {item.processedAt ? formatDate({ date: item.processedAt }) : "—"}
        </div>
      );
    },
  },
];

export const filter: DataTableFilterColumn[] = [
  {
    column: "Status",
    title: "Status",
    multiple: false,
    options: (Object.keys(REFUND_STATUS_LABELS) as RefundStatus[]).map((value) => ({
      value,
      label: REFUND_STATUS_LABELS[value],
    })),
  },
];
