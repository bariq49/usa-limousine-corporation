import { Card, CardContent, CardHeader } from "@usa-limousine-corporation/ui/components/card";
import { Skeleton } from "@usa-limousine-corporation/ui/components/skeleton";

const BAR_HEIGHTS = [55, 78, 42, 90, 64, 70, 48, 82];

export function PerformanceFiltersSkeleton() {
  return (
    <div className="rounded-md border border-border bg-card">
      <div className="flex items-start gap-3 border-b border-border px-4 py-4 sm:px-5">
        <Skeleton className="h-10 w-10 shrink-0 rounded-md" />
        <div className="min-w-0 flex-1 space-y-2 pt-1">
          <Skeleton className="h-4 w-44" />
          <Skeleton className="h-3 w-full max-w-sm" />
        </div>
      </div>

      <div className="flex flex-col gap-3 p-4 sm:p-5 lg:flex-row lg:items-center lg:gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Skeleton className="h-10 w-full rounded-md sm:w-[17.5rem]" />
          <Skeleton className="h-10 w-full rounded-md sm:w-36" />
          <Skeleton className="h-10 w-full rounded-md sm:w-44" />
        </div>
        <div className="flex h-10 w-full shrink-0 items-center justify-end gap-2 lg:ml-auto lg:w-auto">
          <Skeleton className="h-10 w-24 rounded-md" />
          <Skeleton className="h-10 w-24 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function PerformanceRateSkeleton() {
  return (
    <Card className="rounded-md border border-border shadow-xs lg:col-span-4">
      <CardContent className="flex min-h-[280px] flex-col items-center justify-center gap-3 p-6 text-center lg:min-h-[320px]">
        <Skeleton className="h-14 w-24 rounded-md" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="mt-1 h-3 w-44" />
      </CardContent>
    </Card>
  );
}

export function PerformanceChartSkeleton() {
  return (
    <Card className="rounded-md border border-border shadow-xs lg:col-span-8">
      <CardHeader className="border-b border-border/70 px-6 py-4">
        <Skeleton className="h-5 w-64 max-w-full" />
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex h-52 items-end gap-2 overflow-hidden sm:gap-3">
          {BAR_HEIGHTS.map((height, i) => (
            <div key={i} className="flex min-w-[40px] flex-1 flex-col items-center gap-2">
              <div className="relative flex h-40 w-full max-w-[64px] items-end justify-center">
                <Skeleton className="w-full rounded-t-md" style={{ height: `${height}%` }} />
              </div>
              <Skeleton className="h-3 w-8" />
              <Skeleton className="h-2.5 w-10" />
            </div>
          ))}
        </div>
        <Skeleton className="mt-4 h-3 w-56 max-w-full" />
      </CardContent>
    </Card>
  );
}

export function PerformanceReasonsSkeleton() {
  return (
    <Card className="rounded-md border border-border shadow-xs">
      <CardHeader className="border-b border-border/70 px-6 py-4">
        <Skeleton className="h-5 w-80 max-w-full" />
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Skeleton className="h-3 w-3 shrink-0 rounded-sm" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-4 w-14" />
            </div>
          ))}
        </div>
        <Skeleton className="h-2.5 w-full rounded-full" />
      </CardContent>
    </Card>
  );
}

export function PerformanceSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <PerformanceFiltersSkeleton />
      <Skeleton className="h-3 w-72 max-w-full" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <PerformanceRateSkeleton />
        <PerformanceChartSkeleton />
      </div>
      <PerformanceReasonsSkeleton />
    </div>
  );
}
