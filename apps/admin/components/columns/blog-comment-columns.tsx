"use client";

import type {
  ColumnDef,
  DataTableFilterColumn,
} from "@usa-limousine-corporation/ui/data-table/data-table";
import { DataTableColumnHeader } from "@usa-limousine-corporation/ui/data-table/data-table-column-header";
import { Badge } from "@usa-limousine-corporation/ui/components/badge";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { formatDateTime } from "@usa-limousine-corporation/ui/utils/date";
import { Check, Close, Eye, Mail, Trash } from "@usa-limousine-corporation/ui/svg";
import type { BlogComment, BlogCommentStatus } from "@/lib/types/blogs";

export const COMMENT_STATUS_LABELS: Record<BlogCommentStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export const COMMENT_STATUS_COLORS: Record<
  BlogCommentStatus,
  "warning" | "success" | "destructive"
> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "destructive",
};

export const getColumns = (options: {
  onView: (item: BlogComment) => void;
  onReply: (item: BlogComment) => void;
  onStatus: (item: BlogComment, status: BlogCommentStatus) => void;
  onDelete: (item: BlogComment) => void;
}): ColumnDef<BlogComment>[] => [
  {
    id: "Author",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Author" />,
    cell: ({ row }) => (
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-medium text-default-900">
          {row.original.fullName}
        </span>
        <span className="truncate text-xs text-default-500">{row.original.email}</span>
      </div>
    ),
    enableSorting: false,
  },
  {
    id: "Comment",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Comment" />,
    cell: ({ row }) => (
      <p className="line-clamp-2 max-w-sm text-sm text-default-700">{row.original.content}</p>
    ),
    enableSorting: false,
  },
  {
    id: "Article",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Article" />,
    cell: ({ row }) => (
      <span className="line-clamp-1 max-w-56 text-sm text-default-700">
        {row.original.blog.title}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: "Status",
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => (
      <Badge variant="soft" color={COMMENT_STATUS_COLORS[row.original.status]}>
        {COMMENT_STATUS_LABELS[row.original.status]}
      </Badge>
    ),
    enableSorting: false,
  },
  {
    id: "Date",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Posted" />,
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm text-default-700">
        {formatDateTime({ date: row.original.createdAt })}
      </span>
    ),
    enableSorting: false,
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
            className="h-8 w-8 text-default-500 hover:bg-muted hover:text-default-900"
            onClick={() => options.onView(item)}
            title="View comment"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-default-500 hover:bg-muted hover:text-default-900"
            onClick={() => options.onReply(item)}
            title={item.replyContent ? "Edit reply" : "Reply"}
          >
            <Mail className="h-4 w-4" />
          </Button>
          {item.status !== "APPROVED" ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-success hover:bg-success/10"
              onClick={() => options.onStatus(item, "APPROVED")}
              title="Approve"
            >
              <Check className="h-4 w-4" />
            </Button>
          ) : null}
          {item.status !== "REJECTED" ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-warning hover:bg-warning/10"
              onClick={() => options.onStatus(item, "REJECTED")}
              title="Reject"
            >
              <Close className="h-4 w-4" />
            </Button>
          ) : null}
          <Button
            variant="ghost"
            size="icon"
            color="destructive"
            className="h-8 w-8 text-destructive/70 hover:bg-destructive/10 hover:text-destructive"
            onClick={() => options.onDelete(item)}
            title="Delete"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];

export const filter: DataTableFilterColumn[] = [
  {
    column: "Status",
    title: "Status",
    multiple: false,
    options: (Object.keys(COMMENT_STATUS_LABELS) as BlogCommentStatus[]).map((value) => ({
      value,
      label: COMMENT_STATUS_LABELS[value],
    })),
  },
];
