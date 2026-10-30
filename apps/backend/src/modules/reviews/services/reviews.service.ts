import { Inject, Injectable } from "@nestjs/common";
import { AppLogger } from "../../../common/logger/app.logger";
import { PlacesService } from "../../../infrastructure/google/places.service";
import type { ReviewSummary } from "../types/reviews";

const CACHE_TTL_MS = 60 * 60 * 1000;

@Injectable()
export class ReviewsService {
  private cache: { value: ReviewSummary; expiresAt: number } | null = null;

  constructor(
    @Inject(PlacesService) private readonly places: PlacesService,
    @Inject(AppLogger) private readonly logger: AppLogger,
  ) {}

  async summary(): Promise<ReviewSummary> {
    if (this.cache && this.cache.expiresAt > Date.now()) {
      return this.cache.value;
    }

    try {
      const [newest, relevant] = await Promise.all([
        this.places.placeDetails("newest"),
        this.places.placeDetails("most_relevant"),
      ]);
      const seen = new Set<string>();
      const value: ReviewSummary = {
        rating: newest.rating ?? 0,
        totalRatings: newest.user_ratings_total ?? 0,
        reviewsUrl: newest.url ?? null,
        reviews: (newest.reviews ?? [])
          .concat(relevant.reviews ?? [])
          .filter((review) => {
            const key = `${review.author_name ?? ""}-${review.time ?? 0}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          })
          .map((review) => ({
            authorName: review.author_name?.trim() || "Google user",
            authorUrl: review.author_url ?? null,
            photoUrl: review.profile_photo_url ?? null,
            rating: review.rating ?? 5,
            relativeTime: review.relative_time_description ?? "",
            text: review.text?.trim() ?? "",
            time: review.time ?? 0,
          }))
          .filter((review) => review.text.length > 0)
          .sort((a, b) => b.time - a.time),
      };
      this.cache = { value, expiresAt: Date.now() + CACHE_TTL_MS };
      return value;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      this.logger.error(
        `Google reviews refresh failed: ${message}`,
        undefined,
        ReviewsService.name,
      );
      if (this.cache) return this.cache.value;
      throw error;
    }
  }
}
