import { Skeleton } from "../skeleton";

export function BookingDetailSkeleton() {
  return (
    <div className="space-y-4 md:space-y-5">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <Skeleton className="h-10 w-[88px] shrink-0 rounded-md" />
        <div className="flex h-10 min-w-0 flex-1 items-center justify-between gap-2 rounded-md border border-border bg-card px-3 sm:px-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <Skeleton className="h-5 w-5 shrink-0 rounded" />
            <Skeleton className="h-4 w-40 sm:w-56" />
          </div>
          <Skeleton className="h-5 w-20 shrink-0 rounded-full" />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Skeleton className="h-10 w-[96px] rounded-md" />
          <Skeleton className="h-10 w-[88px] rounded-md" />
        </div>
      </div>

      <div className="overflow-hidden rounded-md border border-border bg-card">
        <section className="w-full bg-white">
          <div className="relative mx-auto h-[200px] w-full max-w-5xl sm:h-[260px] md:h-[320px]">
            <Skeleton className="absolute inset-0 h-full w-full rounded-none" />
          </div>
          <div className="flex flex-col items-center px-4 pb-6 pt-3 sm:px-6 sm:pb-8 sm:pt-4">
            <Skeleton className="h-8 w-48 sm:h-9 sm:w-64" />
            <Skeleton className="mt-3 h-4 w-full max-w-xl" />
            <Skeleton className="mt-2 h-4 w-2/3 max-w-md" />
            <div className="mt-4 flex flex-wrap justify-center gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
        </section>

        <section className="px-3 pb-6 pt-6 sm:px-6 sm:pb-8 sm:pt-10 md:px-8">
          <div className="grid w-full items-start gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1.45fr)]">
            <div className="flex flex-col">
              <Skeleton className="h-12 w-12 rounded-full sm:h-14 sm:w-14" />
              <Skeleton className="mt-4 h-8 w-64 max-w-full sm:mt-6 sm:h-9" />
              <Skeleton className="mt-3 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-4/5" />

              <div className="mt-5 rounded-md bg-default-100 p-4 sm:mt-6">
                <Skeleton className="h-5 w-36" />
                <div className="mt-4 space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={`customer-${index}`}
                      className="grid grid-cols-[20px_minmax(0,1fr)] gap-3"
                    >
                      <Skeleton className="h-5 w-5 rounded" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="rounded-md bg-default-100 p-5 sm:p-6">
                <Skeleton className="h-5 w-40" />
                <div className="mt-5 space-y-6">
                  {Array.from({ length: 2 }).map((_, index) => (
                    <div
                      key={`location-${index}`}
                      className="grid grid-cols-[20px_minmax(0,1fr)] gap-3.5"
                    >
                      <Skeleton className="h-5 w-5 rounded" />
                      <div className="space-y-2">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-4 w-4/5" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-md bg-default-100 p-4">
                <Skeleton className="h-5 w-48" />
                <div className="mt-4 grid gap-3 sm:grid-cols-2 sm:gap-5">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div
                      key={`trip-${index}`}
                      className="grid grid-cols-[20px_minmax(0,1fr)] gap-3"
                    >
                      <Skeleton className="h-5 w-5 rounded" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 lg:col-span-2">
              <div className="rounded-md bg-default-100 p-4">
                <Skeleton className="h-5 w-56" />
                <Skeleton className="mt-3 h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-2/3" />
              </div>

              <div className="rounded-md bg-default-100 p-4">
                <Skeleton className="h-5 w-40" />
                <div className="mt-4 space-y-2.5">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={`price-${index}`} className="flex justify-between gap-4">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                  <div className="flex justify-between gap-4 border-t border-border pt-3">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
