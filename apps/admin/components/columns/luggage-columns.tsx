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
import { Trash, Pencil } from "@usa-limousine-corporation/ui/svg";
import { getLuggageIcon } from "@usa-limousine-corporation/ui/components/bookings/luggage-icon";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@usa-limousine-corporation/ui/components/tooltip";
import { formatDate } from "@usa-limousine-corporation/ui/utils/date";
import { formatPrice } from "@usa-limousine-corporation/ui/utils/price";
import type { Item } from "@/lib/types/luggage";

export { getLuggageIcon };

export type LuggageColumnOptions = {
  onDelete?: (item: Item) => void;
  onEdit?: (item: Item) => void;
};

export const getColumns = (options?: LuggageColumnOptions): ColumnDef<Item>[] => [
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
    header: ({ column }) => <DataTableColumnHeader column={column} title="Luggage" />,
    cell: ({ row }) => {
      const item = row.original;
      const Icon = getLuggageIcon(item.name);
      return (
        <div className="flex items-center gap-3">
          {item.image ? (
            <Image
              src={item.image}
              alt={item.name}
              width={40}
              height={40}
              className="h-10 w-10 rounded-md object-cover shrink-0 border border-border bg-white"
              unoptimized
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
              <Icon className="h-6 w-6" />
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <span className="font-medium text-sm text-default-900 truncate">{item.name}</span>
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
    id: "dimensions",
    accessorKey: "dimensions",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Dimensions" />,
    cell: ({ row }) => {
      const dimensions = row.original.dimensions;
      if (!dimensions) {
        return <span className="text-sm text-default-400">—</span>;
      }
      return <span className="text-sm text-default-700 whitespace-nowrap">{dimensions}</span>;
    },
  },
  {
    id: "categories",
    accessorKey: "capacities",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Categories" />,
    cell: ({ row }) => {
      const item = row.original;
      const capacities = item.capacities ?? [];
      const activeCapacities = capacities.filter((c) => c.quantity > 0);
      const count =
        activeCapacities.length > 0
          ? activeCapacities.length
          : capacities.length > 0
            ? capacities.length
            : (item._count?.capacities ?? 0);

      if (count === 0) {
        return (
          <Badge variant="soft" color="secondary" className="font-normal text-xs text-default-500">
            0 categories
          </Badge>
        );
      }

      const displayCapacities = activeCapacities.length > 0 ? activeCapacities : capacities;

      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="inline-flex cursor-pointer">
              <Badge variant="soft" color="info" className="gap-1 font-medium cursor-pointer">
                {count} {count === 1 ? "category" : "categories"}
              </Badge>
            </div>
          </TooltipTrigger>
          <TooltipContent
            color="secondary"
            arrowColor="primary"
            className="border border-primary p-2.5 max-w-xs shadow-md"
          >
            <div className="space-y-1.5 text-xs">
              <p className="font-semibold text-default-900 border-b border-border pb-1">
                Supported Vehicle Categories
              </p>
              <div className="space-y-1">
                {displayCapacities.map((c) => (
                  <div
                    key={c.id || c.categoryId}
                    className="flex items-center justify-between gap-4"
                  >
                    <span className="text-default-700 font-medium">
                      {c.category?.name ?? "Category"}
                    </span>
                    <span className="text-default-500 text-[11px]">Max: {c.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      );
    },
  },
  {
    id: "price",
    accessorKey: "price",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Price" />,
    cell: ({ row }) => {
      const item = row.original;
      const price = item.price != null && item.price !== "" ? Number(item.price) : null;
      if (price == null) {
        return <span className="text-sm text-default-400">—</span>;
      }
      return <span className="font-semibold text-sm text-primary">{formatPrice({ price })}</span>;
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
    id: "createdAt",
    accessorKey: "createdAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
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
          {options?.onEdit ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-default-600 hover:text-default-900 hover:bg-default-100 transition-colors"
              onClick={() => options.onEdit?.(item)}
              title="Edit luggage"
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
            title="Delete luggage"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];

export const columns = getColumns();

export const statusFilter: DataTableFilterColumn[] = [
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

export const filter: DataTableFilterColumn[] = [
  {
    column: "Type",
    title: "Type",
    multiple: false,
    options: [
      { value: "false", label: "Standard" },
      { value: "true", label: "Special" },
    ],
  },
  ...statusFilter,
];
