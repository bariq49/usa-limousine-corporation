"use client";

import Link from "next/link";
import type {
  ColumnDef,
  DataTableFilterColumn,
} from "@usa-limousine-corporation/ui/components/data-table/data-table";
import { DataTableColumnHeader } from "@usa-limousine-corporation/ui/components/data-table/data-table-column-header";
import { Badge } from "@usa-limousine-corporation/ui/components/badge";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { Amex, Card, Discover, Eye, Mastercard, Visa } from "@usa-limousine-corporation/ui/svg";
import { formatDate } from "@usa-limousine-corporation/ui/utils/date";
import type { Payment, PaymentStatus } from "@/lib/types/payments";

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PAID: "Paid",
  REFUNDED: "Refunded",
  CANCELLED: "Cancelled",
};

const CARD_BRAND_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  VISA: Visa,
  MASTERCARD: Mastercard,
  AMEX: Amex,
  AMERICAN_EXPRESS: Amex,
  DISCOVER: Discover,
};

export const getColumns = (): ColumnDef<Payment>[] => [
  {
    id: "transactionId",
    accessorKey: "transactionId",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Transaction" />,
    cell: ({ row }) => {
      const item = row.original;
      const dateText = item.paidAt
        ? formatDate({ date: item.paidAt })
        : formatDate({ date: item.createdAt });

      return (
        <div className="flex flex-col min-w-0">
          {dateText && dateText !== "—" && (
            <span className="text-xs text-default-500">{dateText}</span>
          )}
          <span className="font-mono text-sm font-semibold text-default-900 tracking-tight truncate">
            {item.transactionId || item.id}
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
    id: "cardBrand",
    accessorKey: "cardBrand",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Payment Method" />,
    cell: ({ row }) => {
      const item = row.original;
      const brandKey = item.cardBrand ? item.cardBrand.toUpperCase() : "";
      const BrandIcon = CARD_BRAND_ICONS[brandKey] || Card;

      if (item.cardLast4) {
        return (
          <div className="flex items-center gap-2">
            <BrandIcon className="h-4 w-6 shrink-0 text-default-700" />
            <span className="font-mono text-xs font-medium text-default-700">
              •••• {item.cardLast4}
            </span>
          </div>
        );
      }

      return (
        <div className="flex items-center gap-2">
          <Card className="h-4 w-6 shrink-0 text-default-700" />
          <span className="text-xs text-default-500">Online Card</span>
        </div>
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
          <span className="font-mono text-sm font-bold text-default-900">
            ${item.amount.toFixed(2)}
          </span>
          <span className="text-[10px] font-semibold text-default-500 uppercase">
            {item.currency}
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
  },
  {
    id: "refundedAmount",
    accessorKey: "refundedAmount",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Refund Details" />,
    cell: ({ row }) => {
      const item = row.original;

      if (item.refundedAmount && item.refundedAmount > 0) {
        return (
          <div className="flex flex-col">
            <span className="font-mono text-xs font-semibold text-warning">
              ${item.refundedAmount.toFixed(2)} refunded
            </span>
            {item.refundedAt && (
              <span className="text-[10px] text-default-500">
                {formatDate({ date: item.refundedAt })}
              </span>
            )}
          </div>
        );
      }

      return <span className="text-xs text-default-400">—</span>;
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const item = row.original;

      return (
        <div className="flex items-center justify-end">
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
    options: (Object.keys(PAYMENT_STATUS_LABELS) as PaymentStatus[]).map((value) => ({
      value,
      label: PAYMENT_STATUS_LABELS[value],
    })),
  },
];
