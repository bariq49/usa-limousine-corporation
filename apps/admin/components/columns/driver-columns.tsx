"use client";

import type {
  ColumnDef,
  DataTableFilterColumn,
} from "@usa-limousine-corporation/ui/data-table/data-table";
import { DataTableColumnHeader } from "@usa-limousine-corporation/ui/data-table/data-table-column-header";
import { Checkbox } from "@usa-limousine-corporation/ui/components/checkbox";
import { Badge } from "@usa-limousine-corporation/ui/components/badge";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { Eye, MapPin } from "lucide-react";
import { formatDate } from "@usa-limousine-corporation/ui/utils/date";
import Link from "next/link";
import type { Driver } from "@/lib/types/drivers";

export type ColumnOptions = {
  onView?: (item: Driver) => void;
};

export const getColumns = (options?: ColumnOptions): ColumnDef<Driver>[] => [
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
    id: "App No #",
    accessorKey: "applicationNumber",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Application No." />,
    cell: ({ row }) => {
      const item = row.original;
      const appliedDate = formatDate({ date: item.createdAt });

      return (
        <div className="flex flex-col">
          {appliedDate && appliedDate !== "—" && (
            <span className="text-xs text-default-500">{appliedDate}</span>
          )}
          <Link
            href={`/drivers/profile/${item.id}`}
            className="font-mono text-sm font-semibold text-default-900 hover:text-primary hover:underline transition-colors tracking-tight"
          >
            {item.applicationNumber}
          </Link>
        </div>
      );
    },
  },
  {
    id: "name",
    accessorFn: (row) => `${row.firstName} ${row.lastName} ${row.email}`,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => {
      const item = row.original;

      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-default-900">
            {item.firstName} {item.lastName}
          </span>
          <span className="text-xs text-default-500">{item.email}</span>
        </div>
      );
    },
  },

  {
    id: "Phone",
    accessorFn: (row) =>
      [row.phone, row.postalCode, row.city || row.operatingCity].filter(Boolean).join(" ") || "",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Phone" />,
    cell: ({ row }) => {
      const item = row.original;
      const phone = item.phone;
      const postalCity = [item.postalCode, item.city || item.operatingCity]
        .filter(Boolean)
        .join(" · ");

      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-default-900">{phone || "—"}</span>
          {postalCity && <span className="text-xs text-default-500">{postalCity}</span>}
        </div>
      );
    },
  },

  {
    id: "Location",
    accessorFn: (row) =>
      [row.operatingCity || row.city, row.operatingCountry || row.country]
        .filter(Boolean)
        .join(", ") || "",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Operating" />,
    cell: ({ row }) => {
      const item = row.original;
      const city = item.operatingCity || item.city;
      const country = item.operatingCountry || item.country;

      if (!city && !country) {
        return <span className="text-sm text-default-400">—</span>;
      }

      return (
        <div className="flex flex-col gap-1 min-w-0">
          {city ? (
            <div className="flex items-center gap-1.5 text-sm text-default-900">
              <MapPin className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span className="font-medium truncate">{city}</span>
            </div>
          ) : null}
          {country ? (
            <div className="flex items-center gap-1.5 text-xs text-default-600">
              <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0" />
              <span className="truncate">{country}</span>
            </div>
          ) : null}
        </div>
      );
    },
  },
  {
    id: "Vehicle",
    accessorFn: (row) => {
      const v = row.vehicle;
      if (!v) return "";
      return [v.make, v.model, v.year, v.licensePlate, v.color].filter(Boolean).join(" ");
    },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Vehicle" />,
    cell: ({ row }) => {
      const vehicle = row.original.vehicle;
      if (!vehicle || (!vehicle.make && !vehicle.model && !vehicle.licensePlate)) {
        return <span className="text-sm text-default-400">—</span>;
      }

      const vehicleName =
        [vehicle.make, vehicle.model].filter(Boolean).join(" ") || vehicle.licensePlate || "—";
      const vehicleSubtitle =
        [vehicle.vehicleCategory?.name, vehicle.year, vehicle.licensePlate || vehicle.color]
          .filter(Boolean)
          .join(" · ") || "";

      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-default-900">{vehicleName}</span>
          {vehicleSubtitle && <span className="text-xs text-default-500">{vehicleSubtitle}</span>}
        </div>
      );
    },
  },

  {
    id: "Experience",
    accessorKey: "yearsExperience",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Experience" />,
    cell: ({ row }) => {
      const years = row.original.yearsExperience;
      if (years === null || years === undefined) {
        return <span className="text-sm text-default-400">—</span>;
      }
      return (
        <Badge color="warning" variant="soft" className="font-semibold text-xs">
          {years} {years === 1 ? "Year" : "Years"}
        </Badge>
      );
    },
  },
  {
    id: "Status",
    accessorKey: "approvalStatus",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.original.approvalStatus;

      switch (status) {
        case "APPROVED":
          return (
            <Badge color="success" variant="soft" className="font-semibold text-xs">
              Approved
            </Badge>
          );
        case "PENDING":
          return (
            <Badge color="warning" variant="soft" className="font-semibold text-xs">
              Pending
            </Badge>
          );
        case "REJECTED":
          return (
            <Badge color="destructive" variant="soft" className="font-semibold text-xs">
              Rejected
            </Badge>
          );
        case "UNDER_REVIEW":
          return (
            <Badge color="info" variant="soft" className="font-semibold text-xs">
              Under Review
            </Badge>
          );
        default:
          return (
            <Badge color="secondary" variant="soft" className="font-semibold text-xs">
              {status || "—"}
            </Badge>
          );
      }
    },
    filterFn: (row, id, value: string[] | string) => {
      if (!value || (Array.isArray(value) && value.length === 0)) return true;
      const rowValue = row.getValue(id) as string;
      if (Array.isArray(value)) {
        return value.includes(rowValue);
      }
      return rowValue === value;
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const item = row.original;

      return (
        <div className="flex items-center justify-end gap-1">
          {options?.onView ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-default-500 hover:text-default-900 hover:bg-muted"
              onClick={() => options.onView!(item)}
              title="View application"
            >
              <Eye className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="h-8 w-8 text-default-500 hover:text-default-900 hover:bg-muted"
              title="View application"
            >
              <Link href={`/drivers/profile/${item.id}`}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
          )}
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
      { value: "PENDING", label: "Pending" },
      { value: "UNDER_REVIEW", label: "Under Review" },
      { value: "APPROVED", label: "Approved" },
      { value: "REJECTED", label: "Rejected" },
    ],
  },
];
