"use client";

import type {
  ColumnDef,
  DataTableFilterColumn,
} from "@usa-limousine-corporation/ui/data-table/data-table";
import { DataTableColumnHeader } from "@usa-limousine-corporation/ui/data-table/data-table-column-header";
import { Badge } from "@usa-limousine-corporation/ui/components/badge";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { Eye } from "lucide-react";
import { formatDate } from "@usa-limousine-corporation/ui/utils/date";
import Link from "next/link";
import type { DeleteRequest } from "@/lib/types/delete-requests";

export type ColumnOptions = {
  onView?: (item: DeleteRequest) => void;
};

export const getColumns = (options?: ColumnOptions): ColumnDef<DeleteRequest>[] => [
  {
    id: "App No #",
    accessorFn: (row) => row.driver.applicationNumber,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Application No." />,
    cell: ({ row }) => {
      const item = row.original;
      const requestedAt = formatDate({ date: item.createdAt });

      return (
        <div className="flex flex-col">
          {requestedAt && requestedAt !== "—" && (
            <span className="text-xs text-default-500">{requestedAt}</span>
          )}
          <Link
            href={`/drivers/profile/${item.driver.id}`}
            className="font-mono text-sm font-semibold text-default-900 hover:text-primary hover:underline transition-colors tracking-tight"
          >
            {item.driver.applicationNumber}
          </Link>
        </div>
      );
    },
  },
  {
    id: "name",
    accessorFn: (row) => `${row.driver.firstName} ${row.driver.lastName} ${row.driver.email}`,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => {
      const driver = row.original.driver;

      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-default-900">
            {driver.firstName} {driver.lastName}
          </span>
          <span className="text-xs text-default-500">{driver.email}</span>
        </div>
      );
    },
  },
  {
    id: "Phone",
    accessorFn: (row) => row.driver.phone || "",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Phone" />,
    cell: ({ row }) => (
      <span className="text-sm font-medium text-default-900">
        {row.original.driver.phone || "—"}
      </span>
    ),
  },
  {
    id: "Reason",
    accessorKey: "reason",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Reason" />,
    cell: ({ row }) => {
      const reason = row.original.reason;
      if (!reason) {
        return <span className="text-sm text-default-400">—</span>;
      }
      return <span className="text-sm text-default-900 line-clamp-2 max-w-[280px]">{reason}</span>;
    },
  },
  {
    id: "Status",
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.original.status;

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
        case "CANCELLED":
          return (
            <Badge color="secondary" variant="soft" className="font-semibold text-xs">
              Cancelled
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
              title="View details"
            >
              <Eye className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="h-8 w-8 text-default-500 hover:text-default-900 hover:bg-muted"
              title="View details"
            >
              <Link href={`/drivers/profile/${item.driver.id}`}>
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
      { value: "APPROVED", label: "Approved" },
      { value: "REJECTED", label: "Rejected" },
      { value: "CANCELLED", label: "Cancelled" },
    ],
  },
];
