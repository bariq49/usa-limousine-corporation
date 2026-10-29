import { cn } from "@usa-limousine-corporation/ui/utils/cn";

type Props = {
  variant?: "default" | "landscape";
};

export function BlogCardSkeleton(props: Props) {
  const { variant = "default" } = props;
  const isLandscape = variant === "landscape";

  return (
    <div
      className={cn(
        "flex h-full overflow-hidden rounded-sm border border-border bg-white",
        isLandscape ? "flex-col md:flex-row" : "flex-col",
      )}
    >
      <div
        className={cn(
          "shrink-0 animate-pulse bg-gray-200",
          isLandscape
            ? "aspect-[16/10] w-full md:aspect-auto md:min-h-[280px] md:w-1/2"
            : "aspect-video w-full",
        )}
      />
      <div className={cn("flex flex-1 flex-col", isLandscape ? "p-5 md:p-8" : "p-5")}>
        <div className="flex flex-wrap items-center gap-3">
          <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
          <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
          <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
        </div>
        <div
          className={cn(
            "mt-3 animate-pulse rounded bg-gray-200",
            isLandscape ? "h-7 w-4/5" : "h-5 w-4/5",
          )}
        />
        <div
          className={cn(
            "mt-2 animate-pulse rounded bg-gray-200",
            isLandscape ? "h-7 w-3/5" : "h-5 w-3/5",
          )}
        />
        <div className="mt-3 space-y-2">
          <div className="h-3.5 w-full animate-pulse rounded bg-gray-200" />
          <div className="h-3.5 w-11/12 animate-pulse rounded bg-gray-200" />
          <div className="h-3.5 w-2/3 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="mt-auto pt-4">
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
