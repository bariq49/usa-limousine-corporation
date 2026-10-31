"use client";

import Link from "next/link";
import type {
  ColumnDef,
  DataTableFilterColumn,
} from "@usa-limousine-corporation/ui/components/data-table/data-table";
import { DataTableColumnHeader } from "@usa-limousine-corporation/ui/components/data-table/data-table-column-header";
import { Badge } from "@usa-limousine-corporation/ui/components/badge";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { Eye } from "@usa-limousine-corporation/ui/svg";
import { formatDate } from "@usa-limousine-corporation/ui/utils/date";
import type { Refund, RefundStatus } from "@/lib/types/payments";

export const REFUND_STATUS_LABELS: Record<RefundStatus, string> = {
  PENDING: "Pending",
  COMPLETED: "Completed",
  REJECTED: "Rejected",
  FAILED: "Failed",
};

export type RefundColumnOptions = {
  onComplete?: (item: Refund) => void;
  onReject?: (item: Refund) => void;
};

export const getColumns = (options?: RefundColumnOptions): ColumnDef<Refund>[] => [
  {
    id: "refundNumber",
    accessorKey: "refundNumber",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Refund ID" />,
    cell: ({ row }) => {
      const item = row.original;
      const dateText = item.createdAt ? formatDate({ date: item.createdAt }) : "";

      return (
        <div className="flex flex-col min-w-0">
          {dateText && dateText !== "—" && (
            <span className="text-xs text-default-500">{dateText}</span>
          )}
          <span className="font-mono text-sm font-semibold text-default-900 tracking-tight truncate">
            {item.refundNumber || item.squareRefundId || item.id}
          </span>
        </div>
      );
    },
  },
  {
    id: "bookingId",
    accessorKey: "bookingId",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Booking" />,
    cell: ({ row }) => {
      const item = row.original;
      const bookingNumber = item.booking?.bookingNumber || item.bookingId;

      return (
        <div className="flex flex-col min-w-0">
          <Link
            href={`/bookings/${item.bookingId}`}
            className="font-mono text-sm font-semibold text-primary hover:underline transition-colors tracking-tight truncate"
          >
            {bookingNumber}
          </Link>
          {item.booking?.bookingType && (
            <span className="text-xs text-default-500 capitalize">
              {item.booking.bookingType.toLowerCase().replace(/_/g, " ")}
            </span>
          )}
        </div>
      );
    },
  },
  {
    id: "transactionId",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Transaction" />,
    cell: ({ row }) => {
      const transactionId = row.original.payment?.transactionId;

      if (!transactionId) {
        return <span className="text-xs text-default-400">—</span>;
      }

      return (
        <Link
          href={`/payments?search=${encodeURIComponent(transactionId)}`}
          className="font-mono text-xs font-semibold text-primary hover:underline truncate"
        >
          {transactionId}
        </Link>
      );
    },
  },
  {
    id: "customerName",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" />,
    cell: ({ row }) => {
      const item = row.original;

      return (
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium text-default-900 truncate">
            {item.payment?.customerName || "—"}
          </span>
          {item.payment?.customerEmail && (
            <span className="text-xs text-default-500 truncate">{item.payment.customerEmail}</span>
          )}
        </div>
      );
    },
  },
  {
    id: "isManual",
    accessorKey: "isManual",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Method" />,
    cell: ({ row }) => {
      const isManual = row.original.isManual;

      return (
        <Badge
          variant="soft"
          color={isManual ? "secondary" : "default"}
          className="capitalize text-xs font-medium"
        >
          {isManual ? "Manual" : "Square"}
        </Badge>
      );
    },
  },
  {
    id: "amount",
    accessorKey: "amount",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
    cell: ({ row }) => {
      const item = row.original;

      return (
        <div className="flex items-baseline gap-1">
          <span className="font-mono text-sm font-bold text-warning">
            ${item.amount.toFixed(2)}
          </span>
          <span className="text-[10px] font-semibold text-default-500 uppercase">
            {item.payment?.currency || "USD"}
          </span>
        </div>
      );
    },
    enableSorting: true,
  },
  {
    id: "status",
    accessorKey: "status",
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
          {REFUND_STATUS_LABELS[status] || status}
        </Badge>
      );
    },
  },
  {
    id: "reason",
    accessorKey: "reason",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Reason" />,
    cell: ({ row }) => {
      const reason = row.original.reason;

      return (
        <span className="text-xs text-default-600 line-clamp-1 max-w-[200px]" title={reason || ""}>
          {reason || "—"}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const item = row.original;

      return (
        <div className="flex items-center justify-end gap-1.5">
          {options?.onComplete && item.status === "PENDING" && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs text-success border-success/30 hover:bg-success/10"
              onClick={() => options.onComplete?.(item)}
            >
              Process
            </Button>
          )}
          {options?.onReject && item.status === "PENDING" && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => options.onReject?.(item)}
            >
              Reject
            </Button>
          )}
          {item.status !== "PENDING" && item.processedAt && (
            <span className="text-xs text-default-400">
              {formatDate({ date: item.processedAt })}
            </span>
          )}
          <Link href={`/bookings/${item.bookingId}`}>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-default-500 hover:text-default-900"
              title="View booking"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      );
    },
  },
];

export const filter: DataTableFilterColumn[] = [
  {
    column: "status",
    title: "Status",
    multiple: false,
    options: (Object.keys(REFUND_STATUS_LABELS) as RefundStatus[]).map((value) => ({
      value,
      label: REFUND_STATUS_LABELS[value],
    })),
  },
];
