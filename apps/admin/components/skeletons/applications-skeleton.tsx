import { Breadcrumbs } from "@usa-limousine-corporation/ui/layout/breadcrumbs";
import { Card, CardContent } from "@usa-limousine-corporation/ui/components/card";
import { Skeleton } from "@usa-limousine-corporation/ui/components/skeleton";

export function ApplicationsSkeleton() {
  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/analytics" },
          { label: "Driver" },
          { label: "Applications" },
        ]}
      />

      {/* Main Data Table Skeleton */}
      <Card className="shadow-xs border border-border bg-card">
        <CardContent className="p-6 space-y-4">
          <div className="mb-5 space-y-1.5">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Skeleton className="h-9 w-64 rounded-md" />
          </div>

          <div className="space-y-3 pt-2">
            <Skeleton className="h-10 w-full rounded-md" />
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-md" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
