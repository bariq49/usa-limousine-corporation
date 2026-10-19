import { Card, CardContent, CardHeader } from "@usa-limousine-corporation/ui/components/card";
import { Skeleton } from "@usa-limousine-corporation/ui/components/skeleton";

export function VehicleSkeleton() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      <div className="flex flex-col gap-6 xl:col-span-6">
        <Card className="overflow-hidden rounded-lg border border-border bg-muted relative w-full h-full min-h-[300px] shadow-xs">
          <Skeleton className="absolute inset-0 h-full w-full rounded-none" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <Skeleton className="h-4 w-1/3 mb-2 bg-white/40" />
            <Skeleton className="h-8 w-2/3 bg-white/40" />
          </div>
        </Card>
      </div>

      <div className="flex flex-col gap-6 xl:col-span-6">
        <Card className="h-fit w-full shadow-xs border border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 -ml-2">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-6 w-40" />
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card
                  key={i}
                  className="p-4 rounded-lg border border-border shadow-xs flex flex-col items-center text-center"
                >
                  <Skeleton className="w-6 h-6 rounded-full mb-2" />
                  <Skeleton className="h-4 w-20 mb-1" />
                  <Skeleton className="h-3 w-16 mb-3" />
                  <Skeleton className="w-7 h-7 rounded-full mt-auto" />
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="h-fit w-full shadow-xs border border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 -ml-2">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-6 w-40" />
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border shadow-xs"
                >
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-4 h-4 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="w-6 h-6 rounded-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
