"use client";

import { useState } from "react";
import BlogCard from "@/components/blog/blog-card";
import { fetchBlogPage } from "@/lib/api/blogs";
import type { BlogListProps } from "@/types/blog.types";

export default function BlogList(props: BlogListProps) {
  const { initial, page: initialPage, pages: initialPages, category, tag } = props;
  const [blogs, setBlogs] = useState(initial);
  const [page, setPage] = useState(initialPage);
  const [pages, setPages] = useState(initialPages);
  const [loading, setLoading] = useState(false);

  const hasMore = page < pages;

  const onLoadMore = async () => {
    if (!hasMore || loading) return;
    setLoading(true);
    try {
      const next = await fetchBlogPage({
        page: page + 1,
        category,
        tag,
      });
      setBlogs((current) => {
        const seen = new Set(current.map((item) => item.id));
        const appended = next.data.filter((item) => !seen.has(item.id));
        return [...current, ...appended];
      });
      setPage(next.page);
      setPages(next.pages);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {blogs.map((blog) => (
          <BlogCard key={blog.id} blog={blog} />
        ))}
      </div>

      {hasMore ? (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={loading}
            className="min-w-[160px] rounded-sm border border-black bg-black px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-secondary hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Loading..." : "Load more"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
