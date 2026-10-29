import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  createBlog,
  createTaxonomy,
  deleteBlog,
  deleteBlogComment,
  deleteTaxonomy,
  getBlog,
  getBlogComments,
  getBlogs,
  getTaxonomies,
  replyBlogComment,
  updateBlog,
  updateBlogComment,
  updateTaxonomy,
} from "../../lib/api/blogs";
import type {
  BlogCommentQuery,
  BlogCommentStatus,
  BlogPayload,
  BlogQuery,
  TaxonomyKind,
  TaxonomyPayload,
  TaxonomyQuery,
} from "../../lib/types/blogs";

export const blogKeys = {
  all: ["blogs"] as const,
  list: (params?: BlogQuery) => ["blogs", "list", params] as const,
  detail: (id: string) => ["blogs", "detail", id] as const,
  taxonomy: (kind: TaxonomyKind) => ["blog-taxonomy", kind] as const,
  taxonomyList: (kind: TaxonomyKind, params?: TaxonomyQuery) =>
    ["blog-taxonomy", kind, params] as const,
  comments: ["blog-comments"] as const,
  commentList: (params?: BlogCommentQuery) => ["blog-comments", params] as const,
};

const TAXONOMY_LABELS: Record<TaxonomyKind, string> = { category: "Category", tag: "Tag" };

export const useBlogs = (params?: BlogQuery) => {
  return useQuery({
    queryKey: blogKeys.list(params),
    queryFn: () => getBlogs(params),
    placeholderData: keepPreviousData,
  });
};

export const useBlog = (id: string) => {
  return useQuery({
    queryKey: blogKeys.detail(id),
    queryFn: () => getBlog(id),
    enabled: Boolean(id),
  });
};

export const useCreateBlog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BlogPayload) => createBlog(payload),
    onSuccess: () => {
      toast.success("Article saved successfully");
      return queryClient.invalidateQueries({ queryKey: blogKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save article");
    },
  });
};

export const useUpdateBlog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<BlogPayload> }) =>
      updateBlog(id, payload),
    onSuccess: () => {
      toast.success("Article updated successfully");
      return queryClient.invalidateQueries({ queryKey: blogKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update article");
    },
  });
};

export const useDeleteBlog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteBlog(id),
    onSuccess: () => {
      toast.success("Article deleted successfully");
      return queryClient.invalidateQueries({ queryKey: blogKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete article");
    },
  });
};

export const useTaxonomies = (kind: TaxonomyKind, params?: TaxonomyQuery) => {
  return useQuery({
    queryKey: blogKeys.taxonomyList(kind, params),
    queryFn: () => getTaxonomies(kind, params),
    placeholderData: keepPreviousData,
  });
};

export const useSaveTaxonomy = (kind: TaxonomyKind) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id?: string | undefined; payload: TaxonomyPayload }) =>
      id ? updateTaxonomy(kind, id, payload) : createTaxonomy(kind, payload),
    onSuccess: (_, variables) => {
      toast.success(
        `${TAXONOMY_LABELS[kind]} ${variables.id ? "updated" : "created"} successfully`,
      );
      return queryClient.invalidateQueries({ queryKey: blogKeys.taxonomy(kind) });
    },
    onError: (error: Error) => {
      toast.error(error.message || `Failed to save ${TAXONOMY_LABELS[kind].toLowerCase()}`);
    },
  });
};

export const useDeleteTaxonomy = (kind: TaxonomyKind) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTaxonomy(kind, id),
    onSuccess: () => {
      toast.success(`${TAXONOMY_LABELS[kind]} deleted successfully`);
      return queryClient.invalidateQueries({ queryKey: blogKeys.taxonomy(kind) });
    },
    onError: (error: Error) => {
      toast.error(error.message || `Failed to delete ${TAXONOMY_LABELS[kind].toLowerCase()}`);
    },
  });
};

export const useBlogComments = (params?: BlogCommentQuery) => {
  return useQuery({
    queryKey: blogKeys.commentList(params),
    queryFn: () => getBlogComments(params),
    placeholderData: keepPreviousData,
  });
};

export const useUpdateBlogComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: BlogCommentStatus }) =>
      updateBlogComment(id, status),
    onSuccess: (_, variables) => {
      toast.success(variables.status === "APPROVED" ? "Comment approved" : "Comment updated");
      return queryClient.invalidateQueries({ queryKey: blogKeys.comments });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update comment");
    },
  });
};

export const useReplyBlogComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) => replyBlogComment(id, content),
    onSuccess: () => {
      toast.success("Reply sent to the commenter");
      return queryClient.invalidateQueries({ queryKey: blogKeys.comments });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send reply");
    },
  });
};

export const useDeleteBlogComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteBlogComment(id),
    onSuccess: () => {
      toast.success("Comment deleted");
      return queryClient.invalidateQueries({ queryKey: blogKeys.comments });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete comment");
    },
  });
};
