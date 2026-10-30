import { Inject, Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { GooglePlaceDetails } from "./types/places";

@Injectable()
export class PlacesService {
  constructor(@Inject(ConfigService) private readonly configService: ConfigService) {}

  async placeDetails(
    sort: "newest" | "most_relevant",
  ): Promise<NonNullable<GooglePlaceDetails["result"]>> {
    const key = this.configService.get<string>("GOOGLE_MAPS_API_KEY")?.trim();
    const placeId = this.configService.get<string>("GOOGLE_PLACE_ID")?.trim();
    if (!key || !placeId) {
      throw new ServiceUnavailableException("Google reviews are not configured");
    }

    const params = new URLSearchParams({
      place_id: placeId,
      fields: "rating,user_ratings_total,url,reviews",
      reviews_sort: sort,
      key,
    });

    let payload: GooglePlaceDetails;
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?${params.toString()}`,
        { signal: AbortSignal.timeout(8000) },
      );
      payload = (await response.json()) as GooglePlaceDetails;
    } catch {
      throw new ServiceUnavailableException("Could not reach Google reviews");
    }

    if (payload.status !== "OK" || !payload.result) {
      throw new ServiceUnavailableException(
        payload.error_message || "Could not load Google reviews",
      );
    }
    return payload.result;
  }
}
