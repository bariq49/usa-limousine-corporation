"use client";

import type { ColumnDef, DataTableFilterColumn } from "@usa-limousine-corporation/ui/components/data-table/data-table";
import { DataTableColumnHeader } from "@usa-limousine-corporation/ui/components/data-table/data-table-column-header";
import { Checkbox } from "@usa-limousine-corporation/ui/components/checkbox";
import { Badge } from "@usa-limousine-corporation/ui/components/badge";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { Trash, Pencil } from "@usa-limousine-corporation/ui/svg";
import { formatDistance } from "@usa-limousine-corporation/ui/utils/distance";
import { formatPrice } from "@usa-limousine-corporation/ui/utils/price";
import { APP_DISTANCE_UNIT } from "@usa-limousine-corporation/ui/constants";
import type { Item } from "@/lib/types/hourly-pricing";
import type { CategoryFilterOption } from "./vehicle-pricing-columns";

export type ColumnOptions = {
  onEdit?: (item: Item) => void;
  onDelete?: (item: Item) => void;
};

export const getColumns = (
  options?: ColumnOptions,
): ColumnDef<Item>[] => [
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
    id: "vehicleCategory",
    accessorKey: "vehicleCategory.name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category" />
    ),
    cell: ({ row }) => {
      const name = row.original.vehicleCategory?.name ?? "General Category";
      return (
        <span className="font-semibold text-sm text-default-900 block truncate">
          {name}
        </span>
      );
    },
  },
  {
    id: "durationHours",
    accessorKey: "durationHours",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Duration" />
    ),
    cell: ({ row }) => {
      const hours = Number(row.original.durationHours);
      return (
        <span className="text-sm text-default-600 font-medium">
          {hours} {hours === 1 ? "hour" : "hours"}
        </span>
      );
    },
  },
  {
    id: "price",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Price" />
    ),
    cell: ({ row }) => (
      <span className="font-semibold text-sm text-default-900">
        {formatPrice({ price: row.original.basePrice })}
      </span>
    ),
  },
  {
    id: "includedDistance",
    accessorKey: "includedDistance",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Included Distance" />
    ),
    cell: ({ row }) => {
      const distance = Number(row.original.includedDistance);
      if (distance > 0) {
        return (
          <span className="text-sm text-default-600 font-medium">
            {formatDistance({ distance, digits: 0 })}
          </span>
        );
      }
      return <span className="text-sm text-default-400">—</span>;
    },
  },
  {
    id: "extraDistanceRate",
    accessorKey: "extraDistanceRate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Extra Distance" />
    ),
    cell: ({ row }) => {
      const rate = Number(row.original.extraDistanceRate);
      if (rate > 0) {
        return (
          <span className="text-sm font-medium text-default-900">
            {formatPrice({ price: rate })}/{APP_DISTANCE_UNIT}
          </span>
        );
      }
      return <span className="text-sm text-default-400">—</span>;
    },
  },
  {
    id: "Status",
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge variant="soft" color={status === "ACTIVE" ? "success" : "secondary"}>
          {status === "ACTIVE" ? "Active" : "Inactive"}
        </Badge>
      );
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
              title="Edit hourly pricing"
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
            title="Delete hourly pricing"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];

export const getFilters = (
  categoryOptions: CategoryFilterOption[] = [],
): DataTableFilterColumn[] => [
  ...(categoryOptions.length > 0
    ? [
        {
          column: "vehicleCategory",
          title: "Category",
          multiple: false,
          options: categoryOptions,
        },
      ]
    : []),
  {
    column: "Status",
    title: "Status",
    multiple: false,
    options: [
      { label: "Active", value: "ACTIVE" },
      { label: "Inactive", value: "INACTIVE" },
    ],
  },
];
