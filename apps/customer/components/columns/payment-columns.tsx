"use client";

import type {
  ColumnDef,
  DataTableFilterColumn,
} from "@usa-limousine-corporation/ui/components/data-table/data-table";
import { DataTableColumnHeader } from "@usa-limousine-corporation/ui/components/data-table/data-table-column-header";
import { Badge } from "@usa-limousine-corporation/ui/components/badge";
import { formatDate } from "@usa-limousine-corporation/ui/utils/date";
import Link from "next/link";
import type { Payment, PaymentStatus } from "@/lib/types/payments";

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PAID: "Paid",
  REFUNDED: "Refunded",
  CANCELLED: "Cancelled",
};

export const getColumns = (): ColumnDef<Payment>[] => [
  {
    id: "Transaction",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Transaction ID" />,
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex flex-col">
          <span className="font-mono text-xs font-semibold text-default-900">
            {item.transactionId || item.id}
          </span>
          <span className="text-xs text-default-500">
            {item.paidAt ? formatDate({ date: item.paidAt }) : formatDate({ date: item.createdAt })}
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
    id: "Method",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Payment Method" />,
    cell: ({ row }) => {
      const item = row.original;
      if (item.cardBrand && item.cardLast4) {
        return (
          <span className="text-xs text-default-700">
            {item.cardBrand.toUpperCase()} •••• {item.cardLast4}
          </span>
        );
      }
      return <span className="text-xs text-default-500">Online Card</span>;
    },
    enableSorting: false,
  },
  {
    id: "Amount",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
    cell: ({ row }) => {
      const item = row.original;
      return (
        <span className="text-xs font-semibold text-default-900">
          ${item.amount.toFixed(2)} {item.currency.toUpperCase()}
        </span>
      );
    },
    enableSorting: true,
  },
  {
    id: "Status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.original.status;
      if (status === "PAID") {
        return (
          <Badge variant="soft" color="success">
            Paid
          </Badge>
        );
      }
      if (status === "REFUNDED") {
        return (
          <Badge variant="soft" color="warning">
            Refunded
          </Badge>
        );
      }
      return (
        <Badge variant="soft" color="destructive">
          Cancelled
        </Badge>
      );
    },
    enableSorting: false,
  },
  {
    id: "Refund",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Refund Details" />,
    cell: ({ row }) => {
      const item = row.original;
      if (item.refundedAmount) {
        return (
          <div className="flex flex-col">
            <span className="text-xs font-medium text-warning">
              ${item.refundedAmount.toFixed(2)} refunded
            </span>
            {item.refundedAt ? (
              <span className="text-[10px] text-default-500">
                on {formatDate({ date: item.refundedAt })}
              </span>
            ) : null}
          </div>
        );
      }
      return <span className="text-xs text-default-400">—</span>;
    },
    enableSorting: false,
  },
];

export const filter: DataTableFilterColumn[] = [
  {
    column: "Status",
    title: "Status",
    multiple: false,
    options: (Object.keys(PAYMENT_STATUS_LABELS) as PaymentStatus[]).map((value) => ({
      value,
      label: PAYMENT_STATUS_LABELS[value],
    })),
  },
];
