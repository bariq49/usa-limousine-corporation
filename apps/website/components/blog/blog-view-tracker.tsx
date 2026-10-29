"use client";

import { useEffect } from "react";
import { recordBlogView } from "@/lib/api/blogs";

export default function BlogViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `blog-viewed:${slug}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      return;
    }
    void recordBlogView(slug).catch(() => undefined);
  }, [slug]);

  return null;
}
