import Image from "next/image";
import Link from "next/link";
import { Blog, Clock } from "@usa-limousine-corporation/ui/svg";
import { formatDate } from "@usa-limousine-corporation/ui/utils/date";
import { cn } from "@usa-limousine-corporation/ui/utils/cn";
import type { BlogCardProps } from "@/types/blog.types";

export default function BlogCard(props: BlogCardProps) {
  const { blog, variant = "default" } = props;
  const isLandscape = variant === "landscape";

  return (
    <Link
      href={`/blog/${blog.slug}`}
      className={cn(
        "group flex h-full overflow-hidden rounded-sm border border-border bg-white transition-colors hover:border-secondary",
        isLandscape ? "flex-col md:flex-row" : "flex-col",
      )}
    >
      <div
        className={cn(
          "relative shrink-0 overflow-hidden bg-gray-100",
          isLandscape
            ? "aspect-[16/10] w-full md:aspect-auto md:min-h-[280px] md:w-1/2"
            : "aspect-video w-full",
        )}
      >
        {blog.coverImage ? (
          <Image
            src={blog.coverImage}
            alt={blog.title}
            fill
            sizes={
              isLandscape
                ? "(min-width: 768px) 50vw, 100vw"
                : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            }
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={isLandscape}
          />
        ) : (
          <div className="flex h-full min-h-[200px] w-full items-center justify-center text-gray-300 md:min-h-[280px]">
            <Blog className={isLandscape ? "h-14 w-14" : "h-12 w-12"} />
          </div>
        )}
      </div>

      <div className={cn("flex flex-1 flex-col", isLandscape ? "p-5 md:p-8" : "p-5")}>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-gray-500">
          <span className="font-semibold uppercase tracking-wide text-secondary">
            {blog.category.name}
          </span>
          <span>{formatDate({ date: blog.publishedAt })}</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {blog.readingTimeMinutes} min read
          </span>
        </div>
        <h3
          className={cn(
            "mt-3 line-clamp-2 font-semibold tracking-tight text-black group-hover:text-secondary",
            isLandscape ? "text-2xl" : "text-lg",
          )}
        >
          {blog.title}
        </h3>
        {blog.excerpt ? (
          <p
            className={cn(
              "mt-2 text-sm text-gray-600",
              isLandscape ? "line-clamp-4" : "line-clamp-3",
            )}
          >
            {blog.excerpt}
          </p>
        ) : null}
        <span className="mt-auto pt-4 text-sm font-semibold text-black group-hover:text-secondary">
          Read article
        </span>
      </div>
    </Link>
  );
}
