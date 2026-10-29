"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Breadcrumbs } from "@usa-limousine-corporation/ui/layout/breadcrumbs";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { Card, CardContent } from "@usa-limousine-corporation/ui/components/card";
import { Skeleton } from "@usa-limousine-corporation/ui/components/skeleton";
import { BlogForm } from "@/components/forms/blog-form";
import { useBlog } from "@/hooks/queries/use-blogs";

export default function EditBlogPage() {
  const params = useParams<{ id: string }>();
  const { data: blog, isLoading, isError } = useBlog(params.id);

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/analytics" },
          { label: "Blog", href: "/blogs" },
          { label: blog?.title ?? "Edit Article" },
        ]}
      />
      {isLoading ? (
        <div className="grid grid-cols-12 gap-6">
          <Skeleton className="col-span-12 h-96 xl:col-span-8" />
          <Skeleton className="col-span-12 h-96 xl:col-span-4" />
        </div>
      ) : isError || !blog ? (
        <Card className="shadow-xs">
          <CardContent className="p-8 text-center">
            <p className="text-sm text-default-600">This article could not be found.</p>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link href="/blogs">Back to articles</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <BlogForm initialData={blog} />
      )}
    </div>
  );
}
