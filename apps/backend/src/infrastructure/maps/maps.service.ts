import {
  BadRequestException,
  Inject,
  Injectable,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PLATFORM } from "@usa-limousine-corporation/config";
import type { CalculateDistanceProps, RouteResult, RouteStop } from "./types/maps";

const METERS_PER_MILE = 1609.344;

type GoogleDirectionsPayload = {
  status: string;
  error_message?: string;
  routes?: { legs?: { distance?: { value?: number }; duration?: { value?: number } }[] }[];
};

@Injectable()
export class MapsService {
  constructor(@Inject(ConfigService) private readonly configService: ConfigService) {}

  async calculateDistance(props: CalculateDistanceProps): Promise<RouteResult> {
    const key = this.configService.get<string>("GOOGLE_MAPS_API_KEY")?.trim();
    if (!key) {
      throw new ServiceUnavailableException("Route pricing is not configured");
    }

    const origin = this.point(props.pickup);
    const destination = this.point(props.dropoff);
    if (!origin || !destination) {
      throw new BadRequestException("Pickup and drop-off are required to price this trip");
    }

    const params = new URLSearchParams({
      origin,
      destination,
      mode: "driving",
      units: PLATFORM.locale.distanceUnit === "mile" ? "imperial" : "metric",
      key,
    });

    const waypoints = (props.stops ?? [])
      .map((stop) => this.point(stop))
      .filter((value): value is string => Boolean(value));
    if (waypoints.length) {
      params.set("waypoints", waypoints.join("|"));
    }

    let payload: GoogleDirectionsPayload;
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?${params.toString()}`,
      );
      payload = (await response.json()) as GoogleDirectionsPayload;
    } catch {
      throw new ServiceUnavailableException("Could not calculate the trip route");
    }

    if (payload.status !== "OK" || !payload.routes?.[0]?.legs?.length) {
      throw new BadRequestException(
        payload.error_message || "Could not find a driving route for these addresses",
      );
    }

    const legs = payload.routes[0].legs;
    const meters = legs.reduce((total, leg) => total + (leg.distance?.value ?? 0), 0);
    const seconds = legs.reduce((total, leg) => total + (leg.duration?.value ?? 0), 0);
    if (meters <= 0 || seconds <= 0) {
      throw new BadRequestException("Could not calculate distance for this trip");
    }

    const distance = Math.round((meters / METERS_PER_MILE) * 100) / 100;
    const travelDuration = Math.max(1, Math.round(seconds / 60));

    return { distance, travelDuration };
  }

  private point(stop: RouteStop): string {
    if (
      typeof stop.latitude === "number" &&
      Number.isFinite(stop.latitude) &&
      typeof stop.longitude === "number" &&
      Number.isFinite(stop.longitude)
    ) {
      return `${stop.latitude},${stop.longitude}`;
    }
    return stop.address.trim();
  }
}
