import { Card, CardContent } from "@usa-limousine-corporation/ui/components/card";
import { Skeleton } from "@usa-limousine-corporation/ui/components/skeleton";

export function NotificationPreferencesSkeleton() {
  return (
    <Card className="shadow-xs">
      <CardContent className="p-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="mt-2 h-4 w-80" />

        <div className="mt-6 space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}
