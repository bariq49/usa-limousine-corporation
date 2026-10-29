import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { getBlogComments, postBlogComment } from "@/lib/api/blogs";
import type { BlogCommentBody } from "@/types/blog.types";

export const useBlogComments = (slug: string, page: number) => {
  return useQuery({
    queryKey: ["blog-comments", slug, page],
    queryFn: () => getBlogComments(slug, page),
    placeholderData: keepPreviousData,
  });
};

export const usePostBlogComment = (slug: string) => {
  return useMutation({
    mutationFn: (body: BlogCommentBody) => postBlogComment(slug, body),
  });
};
