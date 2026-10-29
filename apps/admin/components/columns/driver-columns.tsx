"use client";

import Link from "next/link";
import type {
  ColumnDef,
  DataTableFilterColumn,
} from "@usa-limousine-corporation/ui/data-table/data-table";
import { DataTableColumnHeader } from "@usa-limousine-corporation/ui/data-table/data-table-column-header";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@usa-limousine-corporation/ui/components/avatar";
import { Badge } from "@usa-limousine-corporation/ui/components/badge";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { formatDate } from "@usa-limousine-corporation/ui/utils/date";
import { Eye, Pencil, Trash } from "@usa-limousine-corporation/ui/svg";
import type { Driver, DriverStatus } from "@/lib/types/drivers";

export const DRIVER_STATUS_LABELS: Record<DriverStatus, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
};

export function driverName(driver: {
  user: Pick<Driver["user"], "firstName" | "lastName" | "email">;
}) {
  const name = [driver.user.firstName, driver.user.lastName].filter(Boolean).join(" ").trim();
  return name || driver.user.email;
}

export const getColumns = (options: {
  onEdit: (item: Driver) => void;
  onDelete: (item: Driver) => void;
}): ColumnDef<Driver>[] => [
  {
    id: "Driver",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Driver" />,
    cell: ({ row }) => {
      const item = row.original;
      const name = driverName(item);
      return (
        <Link href={`/drivers/${item.id}`} className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            {item.user.avatar ? <AvatarImage src={item.user.avatar} alt={name} /> : null}
            <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
              {(name[0] ?? "?").toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium text-default-900 hover:text-primary">
              {name}
            </span>
            <span className="truncate text-xs text-default-500">{item.user.email}</span>
          </div>
        </Link>
      );
    },
    enableSorting: false,
  },
  {
    id: "Phone",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Phone" />,
    cell: ({ row }) => (
      <span className="text-sm text-default-700">{row.original.user.phone || "—"}</span>
    ),
    enableSorting: false,
  },
  {
    id: "Vehicle",
    accessorKey: "vehicleCategoryId",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Vehicle" />,
    cell: ({ row }) => (
      <span className="text-sm text-default-700">{row.original.vehicleCategory.name}</span>
    ),
    enableSorting: false,
  },
  {
    id: "Rides",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Rides" />,
    cell: ({ row }) => (
      <span className="text-sm text-default-900">{row.original._count.assignments}</span>
    ),
    enableSorting: false,
  },
  {
    id: "Status",
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => (
      <Badge color={row.original.status === "ACTIVE" ? "success" : "destructive"} variant="soft">
        {DRIVER_STATUS_LABELS[row.original.status]}
      </Badge>
    ),
    enableSorting: false,
  },
  {
    id: "Joined",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Joined" />,
    cell: ({ row }) => (
      <span className="text-sm text-default-700">
        {formatDate({ date: row.original.createdAt })}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1">
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-default-500 hover:bg-muted hover:text-default-900"
          title="View driver"
        >
          <Link href={`/drivers/${row.original.id}`}>
            <Eye className="h-4 w-4" />
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-default-600 hover:bg-default-100 hover:text-default-900"
          onClick={() => options.onEdit(row.original)}
          title="Edit driver"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          color="destructive"
          className="h-8 w-8 text-destructive/70 hover:bg-destructive/10 hover:text-destructive"
          onClick={() => options.onDelete(row.original)}
          title="Delete driver"
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];

export const filter = (
  vehicleOptions: { value: string; label: string }[],
): DataTableFilterColumn[] => [
  {
    column: "Status",
    title: "Status",
    multiple: false,
    options: (Object.keys(DRIVER_STATUS_LABELS) as DriverStatus[]).map((value) => ({
      value,
      label: DRIVER_STATUS_LABELS[value],
    })),
  },
  {
    column: "Vehicle",
    title: "Vehicle",
    multiple: false,
    options: vehicleOptions,
  },
];
