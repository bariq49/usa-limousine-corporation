export function TestimonialsSkeleton() {
  return (
    <section className="w-full bg-white py-16 sm:py-20" aria-busy="true" aria-label="Loading reviews">
      <div className="container mx-auto px-4">
        <div className="mx-auto flex max-w-3xl flex-col items-center">
          <div className="h-8 w-80 max-w-full animate-pulse rounded bg-gray-200" />
          <div className="mt-4 h-4 w-full max-w-xl animate-pulse rounded bg-gray-200" />
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className={
                index === 0
                  ? "rounded-md border border-neutral-100 p-6 shadow-sm"
                  : index === 1
                    ? "hidden rounded-md border border-neutral-100 p-6 shadow-sm sm:block"
                    : "hidden rounded-md border border-neutral-100 p-6 shadow-sm lg:block"
              }
            >
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((__, star) => (
                  <div key={star} className="h-5 w-5 animate-pulse rounded-sm bg-gray-200" />
                ))}
              </div>
              <div className="mt-5 space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-11/12 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
              </div>
              <div className="mt-8 flex items-center gap-3 border-t border-neutral-100 pt-4">
                <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-28 animate-pulse rounded bg-gray-200" />
                  <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center gap-2">
          <div className="h-2 w-6 animate-pulse rounded-full bg-gray-200" />
          <div className="h-2 w-2 animate-pulse rounded-full bg-gray-200" />
          <div className="h-2 w-2 animate-pulse rounded-full bg-gray-200" />
        </div>
      </div>
    </section>
  );
}
