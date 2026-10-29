"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Breadcrumbs } from "@usa-limousine-corporation/ui/layout/breadcrumbs";
import { Badge } from "@usa-limousine-corporation/ui/components/badge";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { Card, CardContent } from "@usa-limousine-corporation/ui/components/card";
import { ConfirmDialog } from "@usa-limousine-corporation/ui/components/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@usa-limousine-corporation/ui/components/dialog";
import { Form } from "@usa-limousine-corporation/ui/components/form";
import { Input } from "@usa-limousine-corporation/ui/components/input";
import {
  DataTable,
  type ColumnFiltersState,
} from "@usa-limousine-corporation/ui/components/data-table/data-table";
import { formatDateTime } from "@usa-limousine-corporation/ui/utils/date";
import {
  COMMENT_STATUS_COLORS,
  COMMENT_STATUS_LABELS,
  filter,
  getColumns,
} from "@/components/columns/blog-comment-columns";
import {
  useBlogComments,
  useDeleteBlogComment,
  useReplyBlogComment,
  useUpdateBlogComment,
} from "@/hooks/queries/use-blogs";
import type { BlogComment, BlogCommentStatus } from "@/lib/types/blogs";

type ReplyValues = {
  content: string;
};

function commentInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return (parts[0]?.[0] ?? "?").toUpperCase();
  return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
}

export default function BlogCommentsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [viewing, setViewing] = useState<BlogComment | null>(null);
  const [replying, setReplying] = useState<BlogComment | null>(null);
  const [deleting, setDeleting] = useState<BlogComment | null>(null);
  const updateMutation = useUpdateBlogComment();
  const replyMutation = useReplyBlogComment();
  const deleteMutation = useDeleteBlogComment();
  const replyForm = useForm<ReplyValues>({
    defaultValues: { content: "" },
  });

  const statusFilter = columnFilters.find((item) => item.id === "Status")?.value;
  const status = (Array.isArray(statusFilter) ? statusFilter[0] : statusFilter) as
    | BlogCommentStatus
    | undefined;

  const { data, isLoading, isFetching } = useBlogComments({
    page,
    limit: pageSize,
    search: search || undefined,
    status,
  });

  const columns = useMemo(
    () =>
      getColumns({
        onView: setViewing,
        onReply: (item) => {
          setReplying(item);
          replyForm.reset({ content: item.replyContent ?? "" });
        },
        onStatus: (item, next) => updateMutation.mutate({ id: item.id, status: next }),
        onDelete: setDeleting,
      }),
    [replyForm, updateMutation],
  );

  const closeReply = () => {
    setReplying(null);
    replyForm.reset({ content: "" });
  };

  const onReply = async (values: ReplyValues) => {
    if (!replying) return;
    await replyMutation.mutateAsync({
      id: replying.id,
      content: values.content.trim(),
    });
    closeReply();
  };

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/analytics" },
          { label: "Blog", href: "/blogs" },
          { label: "Comments" },
        ]}
      />

      <Card className="border border-border bg-card shadow-xs">
        <CardContent className="p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-default-900">Comments</h2>
            <p className="mt-1 text-xs text-default-500">
              Review, approve, and reply to reader comments. Replies are emailed to the commenter.
            </p>
          </div>

          <DataTable
            columns={columns}
            data={data?.data ?? []}
            searchKey="Author"
            searchValue={search}
            onSearchChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            searchPlaceholder="Search by name, email or comment..."
            filterColumns={filter}
            columnFilters={columnFilters}
            onColumnFiltersChange={(updater) => {
              setColumnFilters(updater);
              setPage(1);
            }}
            manualFiltering={true}
            loading={isLoading}
            fetching={isFetching}
            pagination={{
              page,
              pageSize,
              total: data?.total ?? 0,
              totalPages: data?.pages ?? 1,
            }}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(viewing)}
        onOpenChange={(open) => {
          if (!open) setViewing(null);
        }}
      >
        <DialogContent className="max-w-xl gap-0 overflow-hidden border-0 p-0 shadow-2xl">
          {viewing ? (
            <>
              <DialogHeader className="border-b border-border px-6 py-4 pr-12 text-left">
                <DialogTitle className="text-base font-semibold text-default-900">
                  View comment
                </DialogTitle>
                <DialogDescription className="text-sm text-default-500">
                  Review the message and approve, reject, or reply by email.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5 px-6 py-5">
                <div className="flex items-start gap-3.5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {commentInitials(viewing.fullName)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-default-900">
                      {viewing.fullName}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-default-500">{viewing.email}</p>
                    <p className="mt-1 text-xs text-default-400">
                      Posted {formatDateTime({ date: viewing.createdAt })}
                    </p>
                  </div>
                  <Badge variant="soft" color={COMMENT_STATUS_COLORS[viewing.status]}>
                    {COMMENT_STATUS_LABELS[viewing.status]}
                  </Badge>
                </div>

                <div className="rounded-md border border-border bg-default-50 px-3.5 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-default-400">
                    Article
                  </p>
                  <Link
                    href={`/blogs/${viewing.blog.id}/edit`}
                    className="mt-1 block truncate text-sm font-medium text-default-800 hover:text-primary"
                  >
                    {viewing.blog.title}
                  </Link>
                </div>

                <div className="rounded-md border border-border bg-card p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-default-400">
                    Comment
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-default-800">
                    {viewing.content}
                  </p>
                </div>

                {viewing.replyContent ? (
                  <div className="rounded-md border border-primary/20 bg-primary/5 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
                      Your reply
                      {viewing.repliedAt
                        ? ` · ${formatDateTime({ date: viewing.repliedAt })}`
                        : ""}
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-default-800">
                      {viewing.replyContent}
                    </p>
                  </div>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border bg-default-50/80 px-6 py-4">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/blogs/${viewing.blog.id}/edit`}>Open article</Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setReplying(viewing);
                    replyForm.reset({ content: viewing.replyContent ?? "" });
                    setViewing(null);
                  }}
                >
                  {viewing.replyContent ? "Edit reply" : "Reply"}
                </Button>
                {viewing.status !== "REJECTED" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    color="destructive"
                    disabled={updateMutation.isPending}
                    onClick={async () => {
                      await updateMutation.mutateAsync({ id: viewing.id, status: "REJECTED" });
                      setViewing(null);
                    }}
                  >
                    Reject
                  </Button>
                ) : null}
                {viewing.status !== "APPROVED" ? (
                  <Button
                    size="sm"
                    isLoading={updateMutation.isPending}
                    onClick={async () => {
                      await updateMutation.mutateAsync({ id: viewing.id, status: "APPROVED" });
                      setViewing(null);
                    }}
                  >
                    Approve
                  </Button>
                ) : null}
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(replying)}
        onOpenChange={(open) => {
          if (!open) closeReply();
        }}
      >
        <DialogContent className="max-w-lg gap-0 overflow-hidden border-0 p-0 shadow-2xl">
          {replying ? (
            <>
              <DialogHeader className="border-b border-border px-6 py-4 pr-12 text-left">
                <DialogTitle className="text-base font-semibold text-default-900">
                  Reply to {replying.fullName}
                </DialogTitle>
                <DialogDescription className="text-sm text-default-500">
                  This reply is emailed to {replying.email} and shown on the article once approved.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 px-6 py-5">
                <div className="rounded-md border border-border bg-default-50 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-default-400">
                    Original comment
                  </p>
                  <p className="mt-1.5 line-clamp-4 whitespace-pre-wrap text-sm text-default-700">
                    {replying.content}
                  </p>
                </div>

                <Form {...replyForm}>
                  <form id="comment-reply-form" onSubmit={replyForm.handleSubmit(onReply)}>
                    <Input
                      name="content"
                      label="Your reply"
                      type="textarea"
                      required
                      maxLength={2000}
                    />
                  </form>
                </Form>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border bg-default-50/80 px-6 py-4">
                <Button type="button" variant="outline" size="sm" onClick={closeReply}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  form="comment-reply-form"
                  size="sm"
                  isLoading={replyMutation.isPending}
                >
                  Send reply
                </Button>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        title="Delete comment?"
        description={
          deleting ? `The comment from ${deleting.fullName} will be removed for good.` : ""
        }
        confirmLabel="Delete"
        confirmColor="destructive"
        pending={deleteMutation.isPending}
        onConfirm={async () => {
          if (!deleting) return;
          try {
            await deleteMutation.mutateAsync(deleting.id);
            setDeleting(null);
          } catch {
            return;
          }
        }}
      />
    </div>
  );
}
