"use client";

import type {
  ColumnDef,
  DataTableFilterColumn,
} from "@usa-limousine-corporation/ui/data-table/data-table";
import { DataTableColumnHeader } from "@usa-limousine-corporation/ui/data-table/data-table-column-header";
import { Badge } from "@usa-limousine-corporation/ui/components/badge";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { formatDate } from "@usa-limousine-corporation/ui/utils/date";
import { Eye } from "lucide-react";
import Link from "next/link";
import type { Ticket, TicketCategory, TicketPriority, TicketStatus } from "@/lib/api/types";
import {
  CATEGORY_LABELS,
  PRIORITY_COLORS,
  PRIORITY_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
} from "@/lib/utils/ticket-labels";

export const getColumns = (options?: { onView?: (item: Ticket) => void }): ColumnDef<Ticket>[] => [
  {
    id: "Ticket",
    accessorKey: "ticketNumber",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Ticket" />,
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex flex-col">
          <Link
            href={`/help-center/${item.id}`}
            className="font-mono text-sm font-semibold tracking-tight text-default-900 transition-colors hover:text-primary hover:underline"
          >
            {item.ticketNumber}
          </Link>
          <span className="text-xs text-default-500">{formatDate({ date: item.createdAt })}</span>
        </div>
      );
    },
  },
  {
    id: "Subject",
    accessorKey: "subject",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Subject" />,
    cell: ({ row }) => (
      <span className="line-clamp-1 max-w-[320px] text-sm font-medium text-default-900">
        {row.original.subject}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: "Category",
    accessorKey: "category",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
    cell: ({ row }) => (
      <span className="text-sm text-default-900">{CATEGORY_LABELS[row.original.category]}</span>
    ),
  },
  {
    id: "Status",
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => (
      <Badge
        color={STATUS_COLORS[row.original.status]}
        variant="soft"
        className="text-xs font-semibold"
      >
        {STATUS_LABELS[row.original.status]}
      </Badge>
    ),
  },
  {
    id: "Priority",
    accessorKey: "priority",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Priority" />,
    cell: ({ row }) => (
      <Badge
        color={PRIORITY_COLORS[row.original.priority]}
        variant="soft"
        className="text-xs font-semibold"
      >
        {PRIORITY_LABELS[row.original.priority]}
      </Badge>
    ),
  },
  {
    id: "Updated",
    accessorKey: "updatedAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Updated" />,
    cell: ({ row }) => (
      <span className="text-sm text-default-700">
        {formatDate({ date: row.original.updatedAt })}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-default-500 hover:bg-muted hover:text-default-900"
          onClick={() => options?.onView?.(row.original)}
          title="Open ticket"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];

export const filter: DataTableFilterColumn[] = [
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
    options: (Object.keys(CATEGORY_LABELS) as TicketCategory[]).map((value) => ({
      value,
      label: CATEGORY_LABELS[value],
    })),
  },
];
