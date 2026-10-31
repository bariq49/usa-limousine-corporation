import { Card, CardContent } from "../components/card";
import { Skeleton } from "../components/skeleton";

export function NotificationListSkeleton() {
  return (
    <Card className="overflow-hidden shadow-xs">
      <CardContent className="p-0">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <Skeleton className="h-9 w-44 rounded-md" />
          <Skeleton className="h-8 w-32 rounded-md" />
        </div>

        <div className="divide-y divide-border">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="flex items-start gap-3.5 px-5 py-4">
              <Skeleton className="mt-0.5 h-9 w-9 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-3.5 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
