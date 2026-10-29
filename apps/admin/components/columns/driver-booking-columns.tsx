"use client";

import Link from "next/link";
import type { ColumnDef } from "@usa-limousine-corporation/ui/components/data-table/data-table";
import { DataTableColumnHeader } from "@usa-limousine-corporation/ui/components/data-table/data-table-column-header";
import { Badge } from "@usa-limousine-corporation/ui/components/badge";
import {
  BOOKING_STATUS_LABELS,
  BOOKING_TYPE_LABELS,
  bookingStatusBadgeColor,
} from "@usa-limousine-corporation/ui/components/bookings/labels";
import { formatDate, formatTime } from "@usa-limousine-corporation/ui/utils/date";
import { formatPrice } from "@usa-limousine-corporation/ui/utils/price";
import type { DriverBooking } from "@/lib/types/drivers";

export const getColumns = (): ColumnDef<DriverBooking>[] => [
  {
    id: "Booking",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Booking" />,
    cell: ({ row }) => {
      const booking = row.original.booking;
      return (
        <Link href={`/bookings/${booking.id}`} className="flex flex-col">
          <span className="text-sm font-medium text-default-900 hover:text-primary">
            {booking.bookingNumber}
          </span>
          <span className="text-xs text-default-500">
            {BOOKING_TYPE_LABELS[booking.bookingType]}
          </span>
        </Link>
      );
    },
    enableSorting: false,
  },
  {
    id: "Pickup",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Pickup" />,
    cell: ({ row }) => {
      const time = row.original.booking.bookingTime;
      return (
        <div className="flex flex-col">
          <span className="text-sm text-default-900">{formatDate({ date: time.pickupDate })}</span>
          <span className="text-xs text-default-500">{formatTime({ date: time.pickupTime })}</span>
        </div>
      );
    },
    enableSorting: false,
  },
  {
    id: "Route",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Route" />,
    cell: ({ row }) => {
      const address = row.original.booking.address;
      return (
        <div className="flex max-w-64 flex-col">
          <span className="truncate text-sm text-default-900">
            {address.pickup?.address || "—"}
          </span>
          {address.dropoff?.address ? (
            <span className="truncate text-xs text-default-500">{address.dropoff.address}</span>
          ) : null}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    id: "Status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => (
      <Badge variant="soft" color={bookingStatusBadgeColor(row.original.booking.status)}>
        {BOOKING_STATUS_LABELS[row.original.booking.status]}
      </Badge>
    ),
    enableSorting: false,
  },
  {
    id: "Total",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Total" />,
    cell: ({ row }) => (
      <span className="text-sm text-default-900">
        {formatPrice({ price: Number(row.original.booking.totalPrice) })}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: "Commission",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Commission" />,
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="text-sm text-default-900">
          {formatPrice({ price: Number(row.original.commissionAmount) })}
        </span>
        <span className="text-xs text-default-500">{Number(row.original.commissionRate)}%</span>
      </div>
    ),
    enableSorting: false,
  },
  {
    id: "Payout",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Driver Payout" />,
    cell: ({ row }) => (
      <span className="text-sm font-semibold text-default-900">
        {formatPrice({ price: Number(row.original.driverAmount) })}
      </span>
    ),
    enableSorting: false,
  },
];
