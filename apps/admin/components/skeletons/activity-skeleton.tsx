import { Skeleton } from "@usa-limousine-corporation/ui/components/skeleton";

const ROWS = 5;

export function ActivitySkeleton() {
  return (
    <ul className="space-y-0">
      {Array.from({ length: ROWS }).map((_, index) => {
        const isLast = index === ROWS - 1;

        return (
          <li key={index} className="relative flex gap-4">
            <div className="relative flex w-4 shrink-0 flex-col items-center">
              <Skeleton className="relative z-10 mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" />
              {!isLast ? <span className="mt-1 w-px flex-1 bg-border" /> : null}
            </div>

            <div className={`min-w-0 flex-1 ${isLast ? "pb-0" : "pb-6"}`}>
              <div className="flex items-start justify-between gap-6">
                <div className="min-w-0 flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-full max-w-md" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <div className="w-[88px] shrink-0 space-y-1 sm:w-[100px]">
                  <Skeleton className="ml-auto h-3 w-14" />
                  <Skeleton className="ml-auto h-3 w-10" />
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
