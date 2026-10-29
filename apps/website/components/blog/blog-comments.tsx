"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { PLATFORM } from "@usa-limousine-corporation/config";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { Form } from "@usa-limousine-corporation/ui/components/form";
import { Input } from "@usa-limousine-corporation/ui/components/input";
import { Close, MessageSquare, Plus } from "@usa-limousine-corporation/ui/svg";
import { formatDate } from "@usa-limousine-corporation/ui/utils/date";
import { useBlogComments, usePostBlogComment } from "@/hooks/queries/use-blogs";
import { useMediaQuery } from "@/hooks/use-media-query";
import type { ApiError } from "@/lib/api/client";

const SHEET_EASE = [0.32, 0.72, 0, 1] as const;

type CommentValues = {
  fullName: string;
  email: string;
  content: string;
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return (parts[0]?.[0] ?? "?").toUpperCase();
  return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
}

export default function BlogComments({ slug }: { slug: string }) {
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 639px)");
  const { data, isLoading } = useBlogComments(slug, page);
  const postMutation = usePostBlogComment(slug);
  const form = useForm<CommentValues>({
    defaultValues: { fullName: "", email: "", content: "" },
  });

  const total = data?.total ?? 0;
  const comments = data?.data ?? [];

  const closeModal = () => setOpen(false);

  const onSubmit = async (values: CommentValues) => {
    try {
      await postMutation.mutateAsync({
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        content: values.content.trim(),
      });
      form.reset();
      closeModal();
      toast.success("Thanks! Your comment will appear once it is approved.");
    } catch (error) {
      toast.error((error as ApiError).message || "We could not post your comment.");
    }
  };

  return (
    <section>
      <div className="flex items-end justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-semibold tracking-tight text-black">Comments</h2>
            {total > 0 ? (
              <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-gray-100 px-2 text-xs font-semibold text-gray-700">
                {total}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Thoughts from readers. Comments are moderated before publishing.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={() => setOpen(true)}
          className="shrink-0 gap-1.5 bg-black text-white hover:bg-black/90"
        >
          <Plus className="h-4 w-4" />
          Add comment
        </Button>
      </div>

      {isLoading ? (
        <div className="divide-y divide-border">
          {[0, 1, 2].map((item) => (
            <div key={item} className="animate-pulse py-6">
              <div className="flex gap-3">
                <div className="h-11 w-11 shrink-0 rounded-full bg-gray-100" />
                <div className="flex-1 space-y-3 pt-1">
                  <div className="h-3.5 w-32 rounded bg-gray-100" />
                  <div className="h-3 w-full rounded bg-gray-100" />
                  <div className="h-3 w-4/5 rounded bg-gray-100" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : total === 0 ? (
        <div className="flex flex-col items-center px-4 py-14 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary/10 text-secondary">
            <MessageSquare className="h-6 w-6" />
          </span>
          <p className="mt-5 text-base font-semibold text-black">Start the conversation</p>
          <p className="mt-1.5 max-w-md text-sm leading-relaxed text-gray-500">
            No comments yet. Ask a question or share your experience — it will appear after a quick
            review.
          </p>
          <Button
            type="button"
            size="sm"
            onClick={() => setOpen(true)}
            className="mt-6 gap-1.5 bg-black text-white hover:bg-black/90"
          >
            <Plus className="h-4 w-4" />
            Write a comment
          </Button>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {comments.map((comment) => (
            <li key={comment.id} className="py-6 first:pt-5">
              <div className="flex gap-3.5">
                <span
                  aria-hidden
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-secondary/20 to-secondary/5 text-sm font-semibold tracking-wide text-secondary ring-1 ring-secondary/15"
                >
                  {initials(comment.fullName)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                    <p className="text-sm font-semibold text-black">{comment.fullName}</p>
                    <time
                      dateTime={comment.createdAt}
                      className="text-xs font-medium text-gray-400"
                    >
                      {formatDate({ date: comment.createdAt })}
                    </time>
                  </div>
                  <p className="mt-2.5 whitespace-pre-wrap text-[15px] leading-7 text-gray-700">
                    {comment.content}
                  </p>
                  {comment.replyContent ? (
                    <div className="mt-4 rounded-sm border border-border bg-gray-50 px-4 py-3">
                      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                        <p className="text-xs font-semibold uppercase tracking-wide text-secondary">
                          Reply from {PLATFORM.shortName}
                        </p>
                        {comment.repliedAt ? (
                          <time
                            dateTime={comment.repliedAt}
                            className="text-xs font-medium text-gray-400"
                          >
                            {formatDate({ date: comment.repliedAt })}
                          </time>
                        ) : null}
                      </div>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                        {comment.replyContent}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {(data?.pages ?? 1) > 1 ? (
        <div className="flex items-center justify-center gap-2 border-t border-border pt-5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Newer
          </Button>
          <span className="px-2 text-xs text-gray-400">
            Page {page} of {data?.pages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= (data?.pages ?? 1)}
            onClick={() => setPage(page + 1)}
          >
            Older
          </Button>
        </div>
      ) : null}

      <DialogPrimitive.Root
        open={open}
        modal={false}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) form.reset();
        }}
      >
        <AnimatePresence>
          {open ? (
            <DialogPrimitive.Portal forceMount>
              <motion.div
                key="comment-backdrop"
                aria-hidden
                className="fixed inset-0 z-50 bg-black/40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                onClick={closeModal}
              />
              <DialogPrimitive.Content asChild forceMount aria-describedby={undefined}>
                <motion.div
                  className="fixed inset-x-0 bottom-0 z-50 flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-sm bg-white shadow-2xl outline-none sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-w-lg sm:rounded-sm"
                  initial={
                    isMobile
                      ? { y: "100%" }
                      : { opacity: 0, scale: 0.96, x: "-50%", y: "-46%" }
                  }
                  animate={
                    isMobile ? { y: 0 } : { opacity: 1, scale: 1, x: "-50%", y: "-50%" }
                  }
                  exit={
                    isMobile
                      ? { y: "100%" }
                      : { opacity: 0, scale: 0.96, x: "-50%", y: "-46%" }
                  }
                  transition={{ duration: 0.35, ease: SHEET_EASE }}
                >
                  {isMobile ? (
                    <div className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-gray-200" />
                  ) : null}

                  <div className="flex shrink-0 items-start gap-3 border-b border-border px-5 py-4">
                    <div className="min-w-0 flex-1">
                      <DialogPrimitive.Title className="text-base font-semibold text-black">
                        Leave a comment
                      </DialogPrimitive.Title>
                      <p className="mt-0.5 text-sm text-gray-500">
                        Your email stays private. Comments appear after review.
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label="Close"
                      onClick={closeModal}
                      className="-mr-1 cursor-pointer p-1 text-gray-400 transition-colors hover:text-black"
                    >
                      <Close className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="overflow-y-auto">
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex flex-col gap-4 p-5 sm:p-6"
                      >
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <Input name="fullName" label="Full name" required maxLength={80} />
                          <Input name="email" label="Email" type="email" required maxLength={255} />
                        </div>
                        <Input
                          name="content"
                          label="Comment"
                          type="textarea"
                          required
                          maxLength={2000}
                        />
                        <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={closeModal}
                            className="sm:min-w-[100px]"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={postMutation.isPending}
                            isLoading={postMutation.isPending}
                            className="bg-black text-white hover:bg-black/90 sm:min-w-[140px]"
                          >
                            Post comment
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </div>
                </motion.div>
              </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
          ) : null}
        </AnimatePresence>
      </DialogPrimitive.Root>
    </section>
  );
}
