export function ChildSeatSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-sm border border-border bg-white px-3 py-3">
      <div className="h-11 w-11 shrink-0 animate-pulse rounded-sm bg-gray-200" />

      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
          <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-12 animate-pulse rounded bg-gray-100" />
        </div>
        <div className="h-3 w-48 max-w-full animate-pulse rounded bg-gray-100" />
      </div>

      <div className="h-11.5 w-30 shrink-0 animate-pulse rounded-sm border border-border bg-gray-50" />
    </div>
  );
}
