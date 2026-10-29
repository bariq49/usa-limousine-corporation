"use client";

import Image from "next/image";
import type {
  ColumnDef,
  DataTableFilterColumn,
} from "@usa-limousine-corporation/ui/components/data-table/data-table";
import { DataTableColumnHeader } from "@usa-limousine-corporation/ui/components/data-table/data-table-column-header";
import { Checkbox } from "@usa-limousine-corporation/ui/components/checkbox";
import { Badge } from "@usa-limousine-corporation/ui/components/badge";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { Grid, Trash, Pencil } from "@usa-limousine-corporation/ui/svg";
import { formatPrice } from "@usa-limousine-corporation/ui/utils/price";
import type { Item } from "@/lib/types/services";

export type ServiceColumnOptions = {
  onEdit?: (item: Item) => void;
  onDelete?: (item: Item) => void;
};

export const getColumns = (options?: ServiceColumnOptions): ColumnDef<Item>[] => [
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
    id: "name",
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Service" />,
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex items-center gap-3">
          {item.image ? (
            <Image
              src={item.image}
              alt={item.name}
              width={40}
              height={40}
              className="h-10 w-10 rounded-md object-cover shrink-0 border border-default-200"
              unoptimized
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-default-100 text-primary shrink-0 border border-default-200">
              <Grid className="h-5 w-5 text-primary" />
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-sm text-default-900 truncate">{item.name}</span>
            {item.description ? (
              <span className="text-xs text-muted-foreground truncate max-w-[280px]">
                {item.description}
              </span>
            ) : null}
          </div>
        </div>
      );
    },
  },
  {
    id: "price",
    accessorKey: "price",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Price" />,
    cell: ({ row }) => {
      return (
        <span className="font-semibold text-sm text-primary">
          {formatPrice({ price: row.original.price })}
        </span>
      );
    },
  },
  {
    id: "Type",
    accessorKey: "type",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
    cell: ({ row }) => {
      const type = row.original.type;
      if (type === "CHILD_SEAT") {
        return (
          <Badge variant="soft" color="info">
            Child Seat
          </Badge>
        );
      }
      return (
        <Badge variant="soft" color="secondary">
          Extra
        </Badge>
      );
    },
    filterFn: (row, _id, value) => {
      const rowVal = String(row.original.type);
      if (Array.isArray(value)) {
        return value.includes(rowVal);
      }
      return rowVal === String(value);
    },
  },
  {
    id: "maxQuantity",
    accessorKey: "maxQuantity",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Max Quantity" />,
    cell: ({ row }) => {
      return <span className="text-sm text-default-700">{row.original.maxQuantity}</span>;
    },
  },
  {
    id: "Status",
    accessorKey: "isActive",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const isActive = row.original.isActive;
      return (
        <Badge variant="soft" color={isActive ? "success" : "secondary"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
    filterFn: (row, _id, value) => {
      const rowVal = String(row.original.isActive);
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
      return (
        <div className="flex items-center justify-end gap-1">
          {options?.onEdit ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-default-600 hover:text-default-900 hover:bg-default-100 transition-colors"
              onClick={() => options.onEdit?.(item)}
              title="Edit service"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          ) : null}
          <Button
            variant="ghost"
            size="icon"
            color="destructive"
            className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-colors"
            onClick={() => options?.onDelete?.(item)}
            title="Delete service"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];

export const columns = getColumns();

export const filter: DataTableFilterColumn[] = [
  {
    column: "Type",
    title: "Type",
    multiple: false,
    options: [
      { value: "CHILD_SEAT", label: "Child Seat" },
      { value: "EXTRA", label: "Extra" },
    ],
  },
  {
    column: "Status",
    title: "Status",
    multiple: false,
    options: [
      { value: "true", label: "Active" },
      { value: "false", label: "Inactive" },
    ],
  },
];
