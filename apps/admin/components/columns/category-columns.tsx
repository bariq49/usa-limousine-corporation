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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@usa-limousine-corporation/ui/components/tooltip";
import { Pencil, Trash, User } from "@usa-limousine-corporation/ui/svg";
import { formatDate } from "@usa-limousine-corporation/ui/utils/date";
import type { Item } from "@/lib/types/vehicle-categories";

export type CategoryColumnOptions = {
  onEdit?: (item: Item) => void;
  onDelete?: (item: Item) => void;
};

export const getColumns = (options?: CategoryColumnOptions): ColumnDef<Item>[] => [
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
    header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex items-center gap-3">
          {item.image ? (
            <Image
              src={item.image}
              alt={item.name}
              width={48}
              height={48}
              className="h-12 w-12 rounded-md object-cover shrink-0"
              unoptimized
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary text-xs font-bold shrink-0">
              {item.name.slice(0, 2).toUpperCase()}
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
    id: "passengerCount",
    accessorKey: "passengerCount",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Passengers" />,
    cell: ({ row }) => {
      const count = row.original.passengerCount;
      return (
        <div className="flex items-center gap-1.5 text-sm text-default-700">
          <User className="h-4 w-4 text-default-400 shrink-0" />
          <span>
            {count} {count === 1 ? "seat" : "seats"}
          </span>
        </div>
      );
    },
  },
  {
    id: "luggage",
    accessorKey: "luggageCapacity",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Luggage" />,
    cell: ({ row }) => {
      const item = row.original;
      const capacities = item.luggageCapacity ?? [];
      const activeCapacities = capacities.filter((c) => c.quantity > 0);
      const count =
        activeCapacities.length > 0
          ? activeCapacities.length
          : capacities.length > 0
            ? capacities.length
            : 0;

      if (count === 0) {
        return (
          <Badge variant="soft" color="secondary" className="font-normal text-xs text-default-500">
            0 luggage
          </Badge>
        );
      }

      const displayCapacities = activeCapacities.length > 0 ? activeCapacities : capacities;

      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="inline-flex cursor-pointer">
              <Badge variant="soft" color="info" className="gap-1 font-medium cursor-pointer">
                {count} {count === 1 ? "luggage" : "luggages"}
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
                Supported Luggage Capacity
              </p>
              <div className="space-y-1">
                {displayCapacities.map((c) => (
                  <div
                    key={c.id || c.luggageTypeId}
                    className="flex items-center justify-between gap-4"
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="text-default-700 font-medium">
                        {c.luggageType?.name ?? "Luggage"}
                      </span>
                      {c.luggageType?.description ? (
                        <span className="text-default-400 text-[10px] truncate max-w-[180px]">
                          {c.luggageType.description}
                        </span>
                      ) : null}
                    </div>
                    <span className="text-default-500 text-[11px] shrink-0">Max: {c.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      );
    },
    enableSorting: false,
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
              title="Edit category"
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
            title="Delete category"
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
    column: "Status",
    title: "Status",
    multiple: false,
    options: [
      { value: "true", label: "Active" },
      { value: "false", label: "Inactive" },
    ],
  },
];
