"use client";

import { Breadcrumbs } from "@usa-limousine-corporation/ui/layout/breadcrumbs";
import { BlogForm } from "@/components/forms/blog-form";

export default function CreateBlogPage() {
  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/analytics" },
          { label: "Blog", href: "/blogs" },
          { label: "New Article" },
        ]}
      />
      <BlogForm />
    </div>
  );
}
