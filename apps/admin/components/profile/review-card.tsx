import { Card, CardContent } from "@usa-limousine-corporation/ui/components/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@usa-limousine-corporation/ui/components/avatar";
import { Star } from "lucide-react";
import type { Review } from "@/lib/types/drivers";

export interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <Card className="shadow-xs overflow-hidden border border-border">
      <CardContent className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <Avatar className="h-9 w-9 shrink-0">
            {review.passenger.avatarUrl ? (
              <AvatarImage src={review.passenger.avatarUrl} alt={review.passenger.name} />
            ) : null}
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
              {review.passenger.initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-semibold text-sm text-default-900 truncate">
                {review.passenger.name}
              </h4>
              <span className="text-[11px] text-default-400 shrink-0">{review.time}</span>
            </div>
            <div className="flex items-center gap-0.5 mt-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < review.rating
                      ? "fill-amber-400 text-amber-400"
                      : "fill-default-200 text-default-200"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
        <p className="text-sm text-default-600 leading-relaxed">{review.comment}</p>
      </CardContent>
    </Card>
  );
}
