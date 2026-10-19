import { Card, CardContent } from "@usa-limousine-corporation/ui/components/card";
import { Star } from "lucide-react";

export function RatingBar({ stars, percentage }: { stars: number; percentage: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-default-600 w-3 text-right">{stars}</span>
      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
      <div className="flex-1 h-2 bg-default-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-400 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-default-500 w-8 text-right">{percentage}%</span>
    </div>
  );
}

export function RatingDistributionCard({ distribution }: { distribution: Record<number, number> }) {
  return (
    <Card className="md:col-span-8 shadow-xs border border-border">
      <CardContent className="p-6 flex flex-col justify-center h-full">
        <h3 className="text-sm font-semibold text-default-900 mb-4">Rating Distribution</h3>
        <div className="flex flex-col gap-2.5">
          {[5, 4, 3, 2, 1].map((stars) => (
            <RatingBar key={stars} stars={stars} percentage={distribution[stars] ?? 0} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
