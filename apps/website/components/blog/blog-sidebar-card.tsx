import Image from "next/image";
import Link from "next/link";
import { Blog, Clock } from "@usa-limousine-corporation/ui/svg";
import { formatDate } from "@usa-limousine-corporation/ui/utils/date";
import type { BlogCardProps } from "@/types/blog.types";

export default function BlogSidebarCard(props: BlogCardProps) {
  const { blog } = props;

  return (
    <Link
      href={`/blog/${blog.slug}`}
      className="group flex gap-3 rounded-sm border border-border bg-white p-3 transition-colors hover:border-secondary"
    >
      <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-sm bg-gray-100">
        {blog.coverImage ? (
          <Image
            src={blog.coverImage}
            alt={blog.title}
            fill
            sizes="96px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-300">
            <Blog className="h-7 w-7" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] font-medium text-gray-500">
          <span className="font-semibold uppercase tracking-wide text-secondary">
            {blog.category.name}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {blog.readingTimeMinutes} min
          </span>
        </div>
        <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug tracking-tight text-black group-hover:text-secondary">
          {blog.title}
        </h3>
        <p className="mt-1 text-[11px] text-gray-500">
          {formatDate({ date: blog.publishedAt })}
        </p>
      </div>
    </Link>
  );
}
