"use client";

import type {
  ColumnDef,
  DataTableFilterColumn,
} from "@usa-limousine-corporation/ui/data-table/data-table";
import { DataTableColumnHeader } from "@usa-limousine-corporation/ui/data-table/data-table-column-header";
import { Checkbox } from "@usa-limousine-corporation/ui/components/checkbox";
import { Badge } from "@usa-limousine-corporation/ui/components/badge";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { Car, Trash } from "@usa-limousine-corporation/ui/svg";
import { formatDate } from "@usa-limousine-corporation/ui/utils/date";
import type { Item } from "@/lib/types/vehicles";

export type VehicleColumnOptions = {
  onDelete?: (item: Item) => void;
};

export const getColumns = (options?: VehicleColumnOptions): ColumnDef<Item>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")
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
    id: "vehicle",
    accessorKey: "make",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Vehicle" />,
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            <Car className="h-6 w-6" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-medium text-sm text-default-900 truncate">
              {item.make} {item.model}
            </span>
            <span className="text-xs text-muted-foreground truncate">
              {item.year} &bull; {item.color}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    id: "licensePlate",
    accessorKey: "licensePlate",
    header: ({ column }) => <DataTableColumnHeader column={column} title="License Plate" />,
    cell: ({ row }) => {
      return (
        <span className="text-sm font-medium text-default-900">{row.original.licensePlate}</span>
      );
    },
  },
  {
    id: "category",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
    cell: ({ row }) => {
      const category = row.original.vehicleCategory;
      if (!category) {
        return <span className="text-sm text-muted-foreground">-</span>;
      }

      return (
        <Badge color="secondary" variant="soft" className="font-medium text-xs">
          {category.name}
        </Badge>
      );
    },
  },
  {
    id: "driver",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Driver" />,
    cell: ({ row }) => {
      const driver = row.original.driver;
      if (!driver) {
        return <span className="text-sm text-muted-foreground">-</span>;
      }

      return (
        <div className="flex flex-col min-w-0">
          <span className="font-medium text-sm text-default-900 truncate">
            {driver.firstName} {driver.lastName}
          </span>
          {driver.email ? (
            <span className="text-xs text-muted-foreground truncate">{driver.email}</span>
          ) : null}
        </div>
      );
    },
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Registered" />,
    cell: ({ row }) => {
      const date = formatDate({ date: row.original.createdAt });
      return <span className="text-sm text-default-600 whitespace-nowrap">{date}</span>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            color="destructive"
            className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-colors"
            onClick={() => options?.onDelete?.(item)}
            title="Delete vehicle"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];

export const columns = getColumns();

export const filter: DataTableFilterColumn[] = [];
