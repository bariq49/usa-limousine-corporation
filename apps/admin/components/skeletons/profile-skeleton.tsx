import { Breadcrumbs } from "@usa-limousine-corporation/ui/layout/breadcrumbs";
import { Card, CardContent } from "@usa-limousine-corporation/ui/components/card";
import { Skeleton } from "@usa-limousine-corporation/ui/components/skeleton";

export function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/analytics" },
          { label: "Drivers", href: "/drivers" },
          { label: "Driver Profile" },
        ]}
      />

      <div className="relative mt-6 mb-4">
        <Card className="overflow-visible rounded-lg shadow-xs border-none bg-transparent">
          <CardContent className="p-0">
            <div className="relative h-[250px] w-full rounded-lg bg-slate-200 dark:bg-slate-800 md:h-[280px] lg:h-[300px] animate-pulse">
              <div className="absolute inset-x-0 bottom-0 px-6 pb-3 lg:px-8 lg:pb-3.5">
                <div className="flex min-w-0 items-end gap-4 sm:gap-5">
                  <div className="relative z-10 shrink-0 mb-[-22px] lg:mb-[-26px]">
                    <Skeleton className="h-[100px] w-[100px] rounded-full border-4 border-background sm:h-[110px] sm:w-[110px] lg:h-[120px] lg:w-[120px]" />
                  </div>

                  <div className="min-w-0 flex flex-col gap-1.5 pb-1">
                    <Skeleton className="h-6 w-48 bg-slate-300 dark:bg-slate-700" />
                    <Skeleton className="h-5 w-44 bg-slate-300 dark:bg-slate-700" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="pt-2">
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
