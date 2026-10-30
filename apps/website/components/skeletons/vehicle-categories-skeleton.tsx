export function VehicleCategoriesSkeleton() {
  return (
    <section
      className="w-full overflow-hidden bg-white py-16 sm:py-20"
      aria-busy="true"
      aria-label="Loading vehicle categories"
    >
      <div className="container mx-auto px-4">
        <div className="mx-auto h-10 w-72 max-w-full animate-pulse rounded bg-gray-200" />

        <div className="mt-10 flex flex-col gap-8 rounded-2xl border border-neutral-100 p-6 md:mx-auto md:mt-18 md:w-3/5 md:flex-row md:items-center md:p-10">
          <div className="h-40 w-full animate-pulse rounded bg-gray-200 md:order-last md:h-48 md:w-2/5" />
          <div className="flex-1 space-y-3">
            <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-36 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-11/12 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
            <div className="mt-6 h-12 w-32 animate-pulse rounded-full bg-gray-200" />
          </div>
        </div>
      </div>
    </section>
  );
}
