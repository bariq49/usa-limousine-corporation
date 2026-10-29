"use client";

import { cn } from "../utils/cn";

interface VehicleCategoryCardSkeletonProps {
  isExpanded?: boolean;
}

export function VehicleCategoryCardSkeleton({
  isExpanded = false,
}: VehicleCategoryCardSkeletonProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-sm border border-border bg-gray-50",
        isExpanded && "shadow-sm"
      )}
    >
      <div className="flex items-center p-2 py-1 md:p-4">
        <div className="relative flex aspect-4/3 w-36 flex-shrink-0 items-center justify-center overflow-hidden rounded-sm bg-gray/10 px-1 sm:aspect-auto sm:w-40 sm:px-2 lg:w-48">
          <div className="aspect-video w-full animate-pulse rounded-sm bg-gray-200" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-between">
          <div className="flex items-stretch justify-between gap-2">
            <div className="flex min-w-0 flex-1 flex-col justify-between">
              <div className="space-y-1">
                <div className="h-4 w-28 animate-pulse rounded bg-gray-200 sm:h-5 sm:w-36" />
                <div className="h-3 w-36 animate-pulse rounded bg-gray-200 sm:h-4 sm:w-48" />
              </div>

              <div className="flex flex-wrap gap-1 pt-2 sm:gap-2">
                <div className="h-6 w-12 shrink-0 animate-pulse rounded-full bg-gray-200 sm:h-7 sm:w-16" />
                <div className="h-6 w-12 shrink-0 animate-pulse rounded-full bg-gray-200 sm:h-7 sm:w-16" />
                <div className="h-6 w-7 shrink-0 animate-pulse rounded-full bg-gray-200 sm:h-7 sm:w-10" />
              </div>
            </div>

            <div className="flex flex-shrink-0 flex-col items-end justify-between">
              <div className="h-5 w-5 animate-pulse rounded-full border-2 border-gray-200 bg-transparent sm:h-6 sm:w-6" />

              <div className="flex flex-col items-end gap-1">
                <div className="h-3 w-12 animate-pulse rounded bg-gray-200 sm:w-14" />
                <div className="h-5 w-16 animate-pulse rounded bg-gray-200 sm:h-7 sm:w-20" />
                <div className="h-3 w-20 animate-pulse rounded bg-gray-200 sm:w-24" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {isExpanded ? (
        <div>
          <div className="mx-4 border-t border-dashed border-border" />

          <div className="flex flex-col items-center justify-center gap-4 px-4 py-2 sm:flex-row sm:justify-between">
            <div className="flex w-full items-center justify-between gap-x-1 sm:w-auto sm:justify-start sm:gap-x-8">
              <div className="space-y-1.5">
                <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
                <div className="h-8 w-28 animate-pulse rounded-full bg-gray-200" />
              </div>
              <div className="space-y-1.5">
                <div className="h-3 w-10 animate-pulse rounded bg-gray-200" />
                <div className="h-8 w-28 animate-pulse rounded-full bg-gray-200" />
              </div>
            </div>

            <div className="hidden h-9 w-28 animate-pulse rounded-sm bg-gray-200 sm:block" />
          </div>

          <div className="mx-4 border-t border-dashed border-border" />

          <div className="space-y-2 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-24 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-4 animate-pulse rounded bg-gray-200" />
            </div>
            <div className="flex items-center justify-between">
              <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-14 animate-pulse rounded bg-gray-200" />
            </div>
            <div className="flex items-center justify-between">
              <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-12 animate-pulse rounded bg-gray-200" />
            </div>
            <div className="flex items-center justify-between border-t border-border pt-2">
              <div className="h-3.5 w-24 animate-pulse rounded bg-gray-200" />
              <div className="h-3.5 w-16 animate-pulse rounded bg-gray-200" />
            </div>
          </div>

          <div className="h-9 w-full animate-pulse rounded-b-sm bg-gray-200 sm:hidden" />
        </div>
      ) : null}
    </div>
  );
}
