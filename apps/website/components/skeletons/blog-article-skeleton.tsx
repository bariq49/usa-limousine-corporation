import { BlogCardSkeleton } from "@/components/skeletons/blog-card-skeleton";

export function BlogArticleSkeleton() {
  return (
    <main className="min-h-screen bg-white pt-24 pb-16 sm:pt-28 md:pt-32">
      <div className="container mx-auto px-4" aria-busy="true" aria-label="Loading article">
        <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />

        <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-8">
            <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
            <div className="mt-3 h-10 w-full animate-pulse rounded bg-gray-200 sm:h-12" />
            <div className="mt-2 h-10 w-4/5 animate-pulse rounded bg-gray-200 sm:h-12" />

            <div className="mt-5 flex flex-wrap gap-4">
              <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
            </div>

            <div className="mt-8 aspect-video w-full animate-pulse rounded-sm bg-gray-200" />

            <div className="mt-8 space-y-3">
              <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-11/12 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
            </div>

            <div className="mt-6 space-y-3">
              <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-10/12 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
            </div>

            <div className="mt-10 flex flex-col gap-4 border-y border-border py-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-2">
                <div className="h-7 w-16 animate-pulse rounded-full bg-gray-200" />
                <div className="h-7 w-20 animate-pulse rounded-full bg-gray-200" />
                <div className="h-7 w-14 animate-pulse rounded-full bg-gray-200" />
              </div>
              <div className="flex gap-2">
                <div className="h-9 w-9 animate-pulse rounded-full bg-gray-200" />
                <div className="h-9 w-9 animate-pulse rounded-full bg-gray-200" />
                <div className="h-9 w-9 animate-pulse rounded-full bg-gray-200" />
              </div>
            </div>

            <div className="mt-10 space-y-4">
              <div className="h-6 w-40 animate-pulse rounded bg-gray-200" />
              <div className="h-24 w-full animate-pulse rounded-sm bg-gray-200" />
              <div className="h-24 w-full animate-pulse rounded-sm bg-gray-200" />
            </div>
          </div>

          <aside className="lg:col-span-4">
            <div className="space-y-8">
              <div>
                <div className="h-6 w-36 animate-pulse rounded bg-gray-200" />
                <div className="mt-4 space-y-5">
                  <BlogCardSkeleton />
                  <BlogCardSkeleton />
                </div>
              </div>

              <div>
                <div className="h-6 w-28 animate-pulse rounded bg-gray-200" />
                <div className="mt-4 divide-y divide-border rounded-sm border border-border">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="flex items-center justify-between px-4 py-3">
                      <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
                      <div className="h-3 w-6 animate-pulse rounded bg-gray-200" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-40 w-full animate-pulse rounded-sm bg-gray-200" />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
