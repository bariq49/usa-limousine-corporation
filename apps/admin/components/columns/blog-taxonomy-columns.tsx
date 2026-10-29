"use client";

import type { ColumnDef } from "@usa-limousine-corporation/ui/data-table/data-table";
import { DataTableColumnHeader } from "@usa-limousine-corporation/ui/data-table/data-table-column-header";
import { Badge } from "@usa-limousine-corporation/ui/components/badge";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { Pencil, Trash } from "@usa-limousine-corporation/ui/svg";
import type { Taxonomy } from "@/lib/types/blogs";

export const getColumns = (options: {
  onEdit: (item: Taxonomy) => void;
  onDelete: (item: Taxonomy) => void;
}): ColumnDef<Taxonomy>[] => [
  {
    id: "Name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => (
      <div className="flex min-w-0 items-center gap-3">
        {row.original.image ? (
          <img
            src={row.original.image}
            alt=""
            className="h-9 w-9 shrink-0 rounded-md object-cover"
          />
        ) : null}
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium text-default-900">{row.original.name}</span>
          <span className="truncate text-xs text-default-500">/{row.original.slug}</span>
        </div>
      </div>
    ),
    enableSorting: false,
  },
  {
    id: "Articles",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Articles" />,
    cell: ({ row }) => (
      <span className="text-sm text-default-900">{row.original._count.blogs}</span>
    ),
    enableSorting: false,
  },
  {
    id: "Order",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Sort Order" />,
    cell: ({ row }) => <span className="text-sm text-default-700">{row.original.sortOrder}</span>,
    enableSorting: false,
  },
  {
    id: "Status",
    accessorKey: "isActive",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => (
      <Badge color={row.original.isActive ? "success" : "destructive"} variant="soft">
        {row.original.isActive ? "Active" : "Inactive"}
      </Badge>
    ),
    enableSorting: false,
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-default-600 hover:bg-default-100 hover:text-default-900"
          onClick={() => options.onEdit(row.original)}
          title="Edit"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          color="destructive"
          className="h-8 w-8 text-destructive/70 hover:bg-destructive/10 hover:text-destructive"
          onClick={() => options.onDelete(row.original)}
          title="Delete"
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];
