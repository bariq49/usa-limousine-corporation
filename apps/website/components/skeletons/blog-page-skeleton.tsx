import { BlogCardSkeleton } from "@/components/skeletons/blog-card-skeleton";

export function BlogPageSkeleton() {
  return (
    <main className="min-h-screen bg-white pt-24 pb-16 sm:pt-28 md:pt-32">
      <section className="container mx-auto px-4" aria-busy="true" aria-label="Loading blog">
        <div className="mb-14">
          <div className="mb-6 h-8 w-28 animate-pulse rounded bg-gray-200" />
          <BlogCardSkeleton variant="landscape" />
          <div className="mt-6 flex items-center justify-between">
            <div className="flex gap-2">
              <div className="h-2.5 w-6 animate-pulse rounded-full bg-gray-200" />
              <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-gray-200" />
              <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-gray-200" />
            </div>
            <div className="flex gap-2">
              <div className="h-9 w-9 animate-pulse rounded-sm bg-gray-200" />
              <div className="h-9 w-9 animate-pulse rounded-sm bg-gray-200" />
            </div>
          </div>
        </div>

        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="mt-2 h-4 w-80 max-w-full animate-pulse rounded bg-gray-200" />

        <div className="mt-5 flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-9 w-24 animate-pulse rounded-full bg-gray-200" />
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <BlogCardSkeleton key={index} />
          ))}
        </div>
      </section>
    </main>
  );
}
