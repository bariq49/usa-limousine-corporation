"use client";

export function Step1FormSkeleton() {
  return (
    <div
      className="relative z-10 flex flex-col items-stretch gap-4 overflow-visible rounded-t-md rounded-b-none bg-white p-5 shadow-none sm:p-6 md:rounded-md md:shadow-xl"
      aria-busy="true"
      aria-label="Loading booking form"
    >
      <div className="-mx-5 -mt-5 mb-1 grid grid-cols-2 overflow-hidden rounded-t-md border-b border-border sm:-mx-6 sm:-mt-6 md:rounded-t-md">
        <div className="h-12 animate-pulse bg-gray-200" />
        <div className="h-12 bg-white" />
      </div>

      <div className="relative space-y-4">
        <div className="absolute bottom-5 left-2 top-4.5 w-1 bg-gray-100" />

        <div className="flex items-center gap-1">
          <div className="h-5 w-5 flex-shrink-0 animate-pulse rounded-full bg-gray-200" />
          <div className="flex flex-1 items-end gap-1">
            <div className="h-11.5 flex-1 animate-pulse rounded-sm bg-gray-100" />
            <div className="h-11.5 w-11.5 animate-pulse rounded-sm bg-gray-100" />
          </div>
        </div>

        <div className="relative left-px flex items-center justify-between">
          <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
          <div className="h-8 w-8 animate-pulse rounded-full bg-gray-100" />
        </div>

        <div className="flex items-center gap-1">
          <div className="h-5 w-5 flex-shrink-0 animate-pulse rounded bg-gray-200" />
          <div className="h-11.5 flex-1 animate-pulse rounded-sm bg-gray-100" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="h-11.5 flex-1 animate-pulse rounded-sm bg-gray-100" />
        <div className="h-11.5 flex-1 animate-pulse rounded-sm bg-gray-100" />
      </div>

      <div className="h-11 w-full animate-pulse rounded-sm bg-secondary/30" />
    </div>
  );
}
