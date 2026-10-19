import { Inject, Injectable } from "@nestjs/common";
import { RedisService } from "../../../infrastructure/redis/redis.service";
import {
  TRIP_LOCATION,
  driverLocationKey,
  locationRateKey,
  tripLocationBufferKey,
  tripLocationKey,
} from "../constants/trip.constants";
import type { Payload } from "../types/location";

@Injectable()
export class LocationStoreService {
  constructor(@Inject(RedisService) private readonly redis: RedisService) {}

  async save(payload: Payload): Promise<void> {
    if (!this.redis.isConfigured()) {
      return;
    }

    const client = this.redis.getClient();
    const body = JSON.stringify(payload);
    const ttl = TRIP_LOCATION.REDIS_TTL_SECONDS;
    await Promise.all([
      client.set(tripLocationKey(payload.tripId), body, "EX", ttl),
      client.set(driverLocationKey(payload.driverId), body, "EX", ttl),
    ]);
  }

  async getByTrip(tripId: string): Promise<Payload | null> {
    if (!this.redis.isConfigured()) {
      return null;
    }

    const raw = await this.redis.getClient().get(tripLocationKey(tripId));
    return this.parse(raw);
  }

  async clear(tripId: string, driverId: string): Promise<void> {
    if (!this.redis.isConfigured()) {
      return;
    }

    const client = this.redis.getClient();
    await client.del(
      tripLocationKey(tripId),
      driverLocationKey(driverId),
      locationRateKey(driverId),
      tripLocationBufferKey(tripId),
    );
  }

  /** Returns false when the driver is updating too frequently. */
  async tryAcquireRate(driverId: string): Promise<boolean> {
    if (!this.redis.isConfigured()) {
      return true;
    }

    const key = locationRateKey(driverId);
    const result = await this.redis
      .getClient()
      .set(key, "1", "PX", TRIP_LOCATION.MIN_INTERVAL_MS, "NX");
    return result === "OK";
  }

  private parse(raw: string | null): Payload | null {
    if (!raw) {
      return null;
    }

    try {
      const value = JSON.parse(raw) as Payload;
      if (
        typeof value.tripId !== "string" ||
        typeof value.driverId !== "string" ||
        typeof value.lat !== "number" ||
        typeof value.lng !== "number" ||
        typeof value.timestamp !== "number"
      ) {
        return null;
      }
      return value;
    } catch {
      return null;
    }
  }
}
