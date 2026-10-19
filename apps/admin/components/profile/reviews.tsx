"use client";

import { Card, CardContent } from "@usa-limousine-corporation/ui/components/card";
import { Star } from "lucide-react";
import { useReviews } from "@/hooks/queries/use-drivers";
import type { Driver, Review } from "@/lib/types/drivers";

import { RatingDistributionCard } from "./rating-distribution-card";
import { ReviewCard } from "./review-card";

export interface ReviewsProps {
  driver?: { id?: string } | Driver | null | undefined;
}

export function Reviews({ driver }: ReviewsProps) {
  const { data } = useReviews(driver?.id ?? "");
  const summary = data?.summary;
  const reviews = data?.reviews ?? [];

  const ratingDistribution = summary?.ratingDistribution ?? {};

  return (
    <div className="flex flex-col gap-6">
      {/* Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Average Rating Card */}
        <Card className="md:col-span-4 shadow-xs border border-border">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
            <div className="text-5xl font-bold text-default-900 mb-1">
              {summary?.averageRating ?? "—"}
            </div>
            <div className="flex items-center gap-0.5 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.round(summary?.averageRating ?? 0)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-default-200 text-default-200"
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-default-500">
              Based on{" "}
              <span className="font-semibold text-default-700">{summary?.totalReviews ?? 0}</span>{" "}
              reviews
            </p>
          </CardContent>
        </Card>

        {/* Rating Distribution Card */}
        <RatingDistributionCard distribution={ratingDistribution} />
      </div>

      {/* Reviews List */}
      <div className="flex flex-col gap-4">
        <h3 className="text-base font-semibold text-default-900">Recent Reviews</h3>

        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reviews.map((review: Review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <Card className="shadow-xs border border-border">
            <CardContent className="p-12 flex flex-col items-center justify-center text-center">
              <Star className="h-10 w-10 text-default-200 mb-3" />
              <p className="text-sm text-default-500">No reviews yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
