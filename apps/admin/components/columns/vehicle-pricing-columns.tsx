"use client";

import type {
  ColumnDef,
  DataTableFilterColumn,
} from "@usa-limousine-corporation/ui/components/data-table/data-table";
import { DataTableColumnHeader } from "@usa-limousine-corporation/ui/components/data-table/data-table-column-header";
import { Checkbox } from "@usa-limousine-corporation/ui/components/checkbox";
import { Badge } from "@usa-limousine-corporation/ui/components/badge";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { Trash, Pencil } from "@usa-limousine-corporation/ui/svg";
import { formatDistance } from "@usa-limousine-corporation/ui/utils/distance";
import { formatPrice } from "@usa-limousine-corporation/ui/utils/price";
import { APP_DISTANCE_UNIT } from "@usa-limousine-corporation/ui/constants";
import type { Item } from "@/lib/types/vehicle-pricing";

export type ColumnOptions = {
  onEdit?: (item: Item) => void;
  onDelete?: (item: Item) => void;
};

export const getColumns = (options?: ColumnOptions): ColumnDef<Item>[] => [
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
    id: "vehicleCategory",
    accessorKey: "vehicleCategory.name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
    cell: ({ row }) => {
      const name = row.original.vehicleCategory?.name ?? "General Category";
      return <span className="font-semibold text-sm text-default-900 block truncate">{name}</span>;
    },
    filterFn: (row, _id, value) => {
      if (!value || (Array.isArray(value) && value.length === 0)) return true;
      const catId = row.original.vehicleCategoryId;
      const catName = row.original.vehicleCategory?.name;
      if (Array.isArray(value)) {
        return value.includes(catId) || (catName ? value.includes(catName) : false);
      }
      return value === catId || value === catName;
    },
  },
  {
    id: "distanceRange",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Distance Range" />,
    cell: ({ row }) => {
      const min = Number(row.original.minimumDistance);
      const max =
        row.original.maximumDistance !== null && row.original.maximumDistance !== undefined
          ? Number(row.original.maximumDistance)
          : null;

      return (
        <span className="text-sm text-default-600 font-medium">
          {formatDistance({ distance: min, digits: 0 })}
          {" – "}
          {max !== null ? formatDistance({ distance: max, digits: 0 }) : "∞"}
        </span>
      );
    },
  },
  {
    id: "pricingType",
    accessorKey: "pricingType",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
    cell: ({ row }) => {
      const type = row.original.pricingType;
      if (type === "PER_UNIT") {
        return <span className="text-sm text-default-600">Per {APP_DISTANCE_UNIT}</span>;
      }
      return <span className="text-sm text-default-600">Fixed</span>;
    },
    filterFn: (row, _id, value) => {
      if (!value || (Array.isArray(value) && value.length === 0)) return true;
      const rowVal = String(row.original.pricingType);
      if (Array.isArray(value)) {
        return value.includes(rowVal);
      }
      return rowVal === String(value);
    },
  },
  {
    id: "price",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Price" />,
    cell: ({ row }) => {
      const item = row.original;
      if (item.pricingType === "PER_UNIT" && item.perUnitRate != null) {
        return (
          <span className="font-semibold text-sm text-default-900">
            {formatPrice({ price: item.perUnitRate })}/{APP_DISTANCE_UNIT}
          </span>
        );
      }
      return (
        <span className="font-semibold text-sm text-default-900">
          {formatPrice({ price: item.basePrice })}
        </span>
      );
    },
  },
  {
    id: "adjustment",
    accessorKey: "percentageRate",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Adjustment %" />,
    cell: ({ row }) => {
      const rate = row.original.percentageRate;
      const num = rate != null ? Number(rate) : 0;
      if (num > 0) {
        return <span className="text-sm font-medium text-default-900">+{num}%</span>;
      }
      return <span className="text-sm text-default-400">—</span>;
    },
  },
  {
    id: "Status",
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge variant="soft" color={status === "ACTIVE" ? "success" : "secondary"}>
          {status === "ACTIVE" ? "Active" : "Inactive"}
        </Badge>
      );
    },
    filterFn: (row, _id, value) => {
      if (!value || (Array.isArray(value) && value.length === 0)) return true;
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
      return (
        <div className="flex items-center justify-end gap-1">
          {options?.onEdit ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-default-600 hover:text-default-900 hover:bg-default-100 transition-colors"
              onClick={() => options.onEdit?.(item)}
              title="Edit pricing slab"
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
            title="Delete pricing slab"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];

export type CategoryFilterOption = {
  label: string;
  value: string;
};

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
  {
    column: "pricingType",
    title: "Type",
    multiple: false,
    options: [
      { label: "Fixed", value: "FIXED" },
      { label: `Per ${APP_DISTANCE_UNIT}`, value: "PER_UNIT" },
    ],
  },
];

export const filter: DataTableFilterColumn[] = getFilters();
