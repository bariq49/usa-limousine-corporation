"use client";

import Link from "next/link";
import type { ColumnDef, DataTableFilterColumn } from "../data-table/data-table";
import { DataTableColumnHeader } from "../data-table/data-table-column-header";
import { Checkbox } from "../components/checkbox";
import { Badge } from "../components/badge";
import { Button } from "../components/button";
import { Eye, MapPin, Navigation, Trash2 } from "lucide-react";
import { formatDate, formatTime } from "../utils/date";
import { formatPrice } from "../utils/price";
import type { BookingStatus, BookingType, Item } from "./types";
import type { BookingColumnOptions } from "../types/bookings";

export type { BookingColumnOptions };

const statusColorMap: Record<
  BookingStatus,
  "success" | "warning" | "destructive" | "secondary" | "info"
> = {
  CONFIRMED: "success",
  PENDING: "warning",
  COMPLETED: "info",
  CANCELLED: "destructive",
  DRAFT: "secondary",
};

const typeLabelMap: Record<BookingType, string> = {
  ONE_WAY: "One Way",
  RETURN: "Return",
  HOURLY: "Hourly",
};

export const getColumns = (options?: BookingColumnOptions): ColumnDef<Item>[] => {
  const basePath = options?.basePath ?? "/bookings";
  const canDelete = Boolean(options?.onDelete);

  const all: ColumnDef<Item>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          size="md"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          size="md"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "bookingNumber",
      accessorKey: "bookingNumber",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Booking" />,
      cell: ({ row }) => {
        const item = row.original;
        const appliedDate = formatDate({ date: item.createdAt });

        return (
          <div className="flex flex-col min-w-0">
            {appliedDate && appliedDate !== "—" && (
              <span className="text-xs text-default-500">{appliedDate}</span>
            )}
            <Link
              href={`${basePath}/${item.id}`}
              className="font-mono text-sm font-semibold text-default-900 hover:text-primary hover:underline transition-colors tracking-tight truncate"
            >
              {item.bookingNumber}
            </Link>
          </div>
        );
      },
    },
    {
      id: "bookingType",
      accessorKey: "bookingType",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <Badge variant="soft" color="secondary" className="whitespace-nowrap">
            {typeLabelMap[item.bookingType] ?? item.bookingType}
          </Badge>
        );
      },
    },
    {
      id: "passenger",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Passenger" />,
      cell: ({ row }) => {
        const p = row.original.passenger;
        if (!p) return <span className="text-sm text-muted-foreground">-</span>;

        return (
          <div className="flex flex-col min-w-0">
            <span className="font-medium text-sm text-default-900 truncate">{p.name}</span>
            <div className="flex items-center gap-2 text-xs text-muted-foreground truncate">
              {p.email && <span>{p.email}</span>}
            </div>
          </div>
        );
      },
    },
    {
      id: "route",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Route" />,
      cell: ({ row }) => {
        const addr = row.original.address;
        if (!addr) return <span className="text-sm text-muted-foreground">-</span>;

        return (
          <div className="flex flex-col gap-1 max-w-[260px]">
            <div className="flex items-center gap-1.5 text-xs text-default-900 truncate">
              <MapPin className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span className="truncate">{addr.pickup?.address || "Pickup"}</span>
            </div>
            {addr.dropoff?.address && (
              <div className="flex items-center gap-1.5 text-xs text-default-600 truncate">
                <Navigation className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                <span className="truncate">{addr.dropoff.address}</span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      id: "vehicle",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Vehicle" />,
      cell: ({ row }) => {
        const category = row.original.vehicleCategory;
        if (!category) return <span className="text-sm text-muted-foreground">-</span>;

        return (
          <Badge variant="soft" color="secondary" className="whitespace-nowrap">
            {category.name}
          </Badge>
        );
      },
    },
    {
      id: "time",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Date & Time" />,
      cell: ({ row }) => {
        const bt = row.original.bookingTime;
        if (!bt) return <span className="text-sm text-muted-foreground">-</span>;

        return (
          <div className="flex flex-col text-xs">
            <span className="font-medium text-default-900">
              {formatTime({ date: bt.pickupTime })}
            </span>
            <span className="text-muted-foreground">{formatDate({ date: bt.pickupDate })}</span>
          </div>
        );
      },
    },
    {
      id: "price",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Price" />,
      cell: ({ row }) => {
        const total = row.original.pricing?.total;
        if (total === undefined) return <span className="text-sm text-muted-foreground">-</span>;

        return (
          <span className="font-semibold text-sm text-default-900">
            {formatPrice({ price: total })}
          </span>
        );
      },
    },
    {
      id: "Status",
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge variant="soft" color={statusColorMap[status] ?? "secondary"}>
            {status}
          </Badge>
        );
      },
      filterFn: (row, _id, value) => {
        const rowVal = String(row.original.status);
        if (Array.isArray(value)) {
          return value.includes(rowVal);
        }
        return rowVal === String(value);
      },
    },

    {
      id: "actions",
      cell: ({ row }) => {
        const item = row.original;
        if (!canDelete) {
          return (
            <div className="flex items-center justify-end gap-1">
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-default-500"
                title="View booking"
              >
                <Link href={`${basePath}/${item.id}`}>
                  <Eye className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          );
        }
        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              color="destructive"
              className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-colors"
              onClick={() => options?.onDelete?.(item)}
              title="Delete booking"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return canDelete ? all : all.filter((column) => column.id !== "select");
};

export const columns = getColumns();

export const filter: DataTableFilterColumn[] = [
  {
    column: "Status",
    title: "Status",
    multiple: false,
    options: [
      { value: "CONFIRMED", label: "Confirmed" },
      { value: "PENDING", label: "Pending" },
      { value: "COMPLETED", label: "Completed" },
      { value: "CANCELLED", label: "Cancelled" },
      { value: "DRAFT", label: "Draft" },
    ],
  },
];
