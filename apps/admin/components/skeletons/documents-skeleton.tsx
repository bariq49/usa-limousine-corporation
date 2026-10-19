import { Card } from "@usa-limousine-corporation/ui/components/card";
import { Skeleton } from "@usa-limousine-corporation/ui/components/skeleton";

export function DocumentsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <Card
          key={i}
          className="relative overflow-hidden aspect-[4/3] sm:aspect-auto sm:min-h-[250px] border border-border shadow-xs"
        >
          <Skeleton className="absolute inset-0 h-full w-full rounded-none" />
          <div className="absolute top-0 right-0 z-30">
            <Skeleton className="h-6 w-20 rounded-none rounded-bl-xl" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 px-3 pb-2.5 pt-6 z-10">
            <Skeleton className="h-5 w-3/4 bg-white/40 mb-1" />
          </div>
        </Card>
      ))}
    </div>
  );
}
