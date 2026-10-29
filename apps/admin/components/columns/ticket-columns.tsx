"use client";

import type {
  ColumnDef,
  DataTableFilterColumn,
} from "@usa-limousine-corporation/ui/components/data-table/data-table";
import { DataTableColumnHeader } from "@usa-limousine-corporation/ui/components/data-table/data-table-column-header";
import { Badge } from "@usa-limousine-corporation/ui/components/badge";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { Checkbox } from "@usa-limousine-corporation/ui/components/checkbox";
import { Trash } from "@usa-limousine-corporation/ui/svg";
import { formatDate } from "@usa-limousine-corporation/ui/utils/date";
import { Eye } from "lucide-react";
import Link from "next/link";
import type { Ticket, TicketPriority, TicketSource, TicketStatus } from "@/lib/types/tickets";
import {
  CATEGORY_LABELS,
  PRIORITY_LABELS,
  SOURCE_LABELS,
  STATUS_LABELS,
  formatCategory,
  priorityBadgeColor,
  statusBadgeColor,
  ticketOwner,
} from "@/lib/utils/ticket-labels";

export type ColumnOptions = {
  onView?: (item: Ticket) => void;
  onDelete?: (item: Ticket) => void;
};

function statusBadge(status: TicketStatus) {
  return (
    <Badge color={statusBadgeColor(status)} variant="soft" className="font-semibold text-xs">
      {STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

function priorityBadge(priority: TicketPriority) {
  return (
    <Badge color={priorityBadgeColor(priority)} variant="soft" className="font-semibold text-xs">
      {PRIORITY_LABELS[priority] ?? priority}
    </Badge>
  );
}

export const getColumns = (options?: ColumnOptions): ColumnDef<Ticket>[] => [
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
    id: "Ticket",
    accessorKey: "ticketNumber",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Ticket" />,
    cell: ({ row }) => {
      const item = row.original;
      const createdAt = formatDate({ date: item.createdAt });

      return (
        <div className="flex flex-col">
          {createdAt && createdAt !== "—" && (
            <span className="text-xs text-default-500">{createdAt}</span>
          )}
          <Link
            href={`/help-center/${item.id}`}
            className="font-mono text-sm font-semibold text-default-900 hover:text-primary hover:underline transition-colors tracking-tight"
          >
            {item.ticketNumber}
          </Link>
        </div>
      );
    },
  },
  {
    id: "Owner",
    accessorFn: (row) => {
      const owner = ticketOwner(row);
      return `${owner.name} ${owner.email}`;
    },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Owner" />,
    cell: ({ row }) => {
      const item = row.original;
      const { name, email } = ticketOwner(item);

      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-default-900">{name}</span>
          <span className="text-xs text-default-500">{email}</span>
        </div>
      );
    },
  },
  {
    id: "Source",
    accessorKey: "source",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Source" />,
    cell: ({ row }) => (
      <Badge
        color={row.original.source === "WEBSITE" ? "info" : "secondary"}
        variant="soft"
        className="text-xs font-semibold"
      >
        {SOURCE_LABELS[row.original.source] ?? row.original.source}
      </Badge>
    ),
  },
  {
    id: "Category",
    accessorKey: "category",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
    cell: ({ row }) => (
      <span className="text-sm text-default-900">{formatCategory(row.original.category)}</span>
    ),
    filterFn: (row, id, value: string[] | string) => {
      if (!value || (Array.isArray(value) && value.length === 0)) return true;
      const rowValue = row.getValue(id) as string;
      return Array.isArray(value) ? value.includes(rowValue) : rowValue === value;
    },
  },
  {
    id: "Status",
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => statusBadge(row.original.status),
    filterFn: (row, id, value: string[] | string) => {
      if (!value || (Array.isArray(value) && value.length === 0)) return true;
      const rowValue = row.getValue(id) as string;
      return Array.isArray(value) ? value.includes(rowValue) : rowValue === value;
    },
  },
  {
    id: "Priority",
    accessorKey: "priority",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Priority" />,
    cell: ({ row }) => priorityBadge(row.original.priority),
    filterFn: (row, id, value: string[] | string) => {
      if (!value || (Array.isArray(value) && value.length === 0)) return true;
      const rowValue = row.getValue(id) as string;
      return Array.isArray(value) ? value.includes(rowValue) : rowValue === value;
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-default-500 hover:text-default-900 hover:bg-muted"
            onClick={() => options?.onView?.(item)}
            title="Open ticket"
          >
            <Eye className="h-4 w-4" />
          </Button>
          {options?.onDelete ? (
            <Button
              variant="ghost"
              size="icon"
              color="destructive"
              className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-colors"
              onClick={() => options?.onDelete?.(item)}
              title="Delete ticket"
            >
              <Trash className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      );
    },
  },
];

export const filter: DataTableFilterColumn[] = [
  {
    column: "Source",
    title: "Source",
    multiple: false,
    options: (Object.keys(SOURCE_LABELS) as TicketSource[]).map((value) => ({
      value,
      label: SOURCE_LABELS[value],
    })),
  },
  {
    column: "Status",
    title: "Status",
    multiple: false,
    options: (Object.keys(STATUS_LABELS) as TicketStatus[]).map((value) => ({
      value,
      label: STATUS_LABELS[value],
    })),
  },
  {
    column: "Priority",
    title: "Priority",
    multiple: false,
    options: (Object.keys(PRIORITY_LABELS) as TicketPriority[]).map((value) => ({
      value,
      label: PRIORITY_LABELS[value],
    })),
  },
  {
    column: "Category",
    title: "Category",
    multiple: false,
    options: (Object.keys(CATEGORY_LABELS) as Array<keyof typeof CATEGORY_LABELS>).map((value) => ({
      value,
      label: CATEGORY_LABELS[value],
    })),
  },
];
