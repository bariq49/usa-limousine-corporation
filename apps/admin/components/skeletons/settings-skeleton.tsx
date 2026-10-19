import { Breadcrumbs } from "@usa-limousine-corporation/ui/layout/breadcrumbs";
import { Card, CardContent, CardHeader } from "@usa-limousine-corporation/ui/components/card";
import { Skeleton } from "@usa-limousine-corporation/ui/components/skeleton";

export function SettingsSkeleton() {
  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/analytics" },
          { label: "Settings" },
          { label: "Platform Settings" },
        ]}
      />

      <Card className="rounded-md border border-border shadow-xs bg-card">
        <CardHeader className="mb-0 flex flex-row items-center justify-between gap-4 border-b border-border px-5 py-4">
          <div className="space-y-1.5">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-3.5 w-72" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-24" />
          </div>
        </CardHeader>

        <CardContent className="space-y-6 p-5">
          {/* Section 1: Payment Environment Skeleton */}
          <div>
            <div className="mb-3 flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-md" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-56" />
              </div>
            </div>

            <div className="overflow-hidden rounded-md border border-border">
              <div className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-80" />
                </div>
                <Skeleton className="h-6 w-11 rounded-full shrink-0" />
              </div>
            </div>
          </div>

          {/* Section 2: Payout Configuration Skeleton */}
          <div>
            <div className="mb-3 flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-md" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-64" />
              </div>
            </div>

            <div className="overflow-hidden rounded-md border border-border">
              <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-44" />
                  <Skeleton className="h-3 w-64" />
                </div>
                <Skeleton className="h-9 w-32 rounded-md shrink-0" />
              </div>

              <div className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-60" />
                </div>
                <Skeleton className="h-9 w-32 rounded-md shrink-0" />
              </div>
            </div>
          </div>

          {/* Section 3: Dispatch & Subscription Policies Skeleton */}
          <div>
            <div className="mb-3 flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-md" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-64" />
              </div>
            </div>

            <div className="overflow-hidden rounded-md border border-border">
              <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-44" />
                  <Skeleton className="h-3 w-80" />
                </div>
                <Skeleton className="h-6 w-11 rounded-full shrink-0" />
              </div>

              <div className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-56" />
                  <Skeleton className="h-3 w-72" />
                </div>
                <Skeleton className="h-9 w-32 rounded-md shrink-0" />
              </div>
            </div>
          </div>
        </CardContent>

        <div className="flex items-center justify-between border-t border-border px-5 py-3">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-3 w-16" />
        </div>
      </Card>
    </div>
  );
}
