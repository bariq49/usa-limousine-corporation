"use client";

import Link from "next/link";
import type { ColumnDef } from "@usa-limousine-corporation/ui/data-table/data-table";
import { DataTableColumnHeader } from "@usa-limousine-corporation/ui/data-table/data-table-column-header";
import { Badge } from "@usa-limousine-corporation/ui/components/badge";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { formatDateTime } from "@usa-limousine-corporation/ui/utils/date";
import { Blog as BlogIcon, Pencil, Trash } from "@usa-limousine-corporation/ui/svg";
import type { Blog, BlogStatus } from "@/lib/types/blogs";

export const BLOG_STATUS_LABELS: Record<BlogStatus, string> = {
  DRAFT: "Draft",
  SCHEDULED: "Scheduled",
  PUBLISHED: "Published",
};

const STATUS_COLORS: Record<BlogStatus, "secondary" | "warning" | "success"> = {
  DRAFT: "secondary",
  SCHEDULED: "warning",
  PUBLISHED: "success",
};

export const getColumns = (options: { onDelete: (item: Blog) => void }): ColumnDef<Blog>[] => [
  {
    id: "Article",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Article" />,
    cell: ({ row }) => {
      const item = row.original;
      return (
        <Link href={`/blogs/${item.id}/edit`} className="flex min-w-0 items-center gap-3">
          {item.coverImage ? (
            <img
              src={item.coverImage}
              alt=""
              className="h-11 w-16 shrink-0 rounded-md object-cover"
            />
          ) : (
            <span className="flex h-11 w-16 shrink-0 items-center justify-center rounded-md bg-default-100 text-default-400">
              <BlogIcon className="h-5 w-5" />
            </span>
          )}
          <div className="flex min-w-0 flex-col">
            <span className="line-clamp-1 text-sm font-medium text-default-900 hover:text-primary">
              {item.title}
            </span>
            <span className="truncate text-xs text-default-500">/{item.slug}</span>
          </div>
        </Link>
      );
    },
    enableSorting: false,
  },
  {
    id: "Category",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
    cell: ({ row }) => (
      <span className="text-sm text-default-700">{row.original.category.name}</span>
    ),
    enableSorting: false,
  },
  {
    id: "Status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => (
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge variant="soft" color={STATUS_COLORS[row.original.status]}>
          {BLOG_STATUS_LABELS[row.original.status]}
        </Badge>
        {row.original.isFeatured ? (
          <Badge variant="soft" color="default">
            Featured
          </Badge>
        ) : null}
      </div>
    ),
    enableSorting: false,
  },
  {
    id: "Date",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Publish Date" />,
    cell: ({ row }) => {
      const date = row.original.scheduledAt ?? row.original.publishedAt;
      return (
        <span className="whitespace-nowrap text-sm text-default-700">
          {date ? formatDateTime({ date }) : "—"}
        </span>
      );
    },
    enableSorting: false,
  },
  {
    id: "Views",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Views" />,
    cell: ({ row }) => <span className="text-sm text-default-900">{row.original.viewCount}</span>,
    enableSorting: false,
  },
  {
    id: "Comments",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Comments" />,
    cell: ({ row }) => (
      <span className="text-sm text-default-900">{row.original._count?.comments ?? 0}</span>
    ),
    enableSorting: false,
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1">
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-default-600 hover:bg-default-100 hover:text-default-900"
          title="Edit article"
        >
          <Link href={`/blogs/${row.original.id}/edit`}>
            <Pencil className="h-4 w-4" />
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          color="destructive"
          className="h-8 w-8 text-destructive/70 hover:bg-destructive/10 hover:text-destructive"
          onClick={() => options.onDelete(row.original)}
          title="Delete article"
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];
