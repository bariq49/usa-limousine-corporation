import { Inject, Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { RedisService } from "../../../infrastructure/redis/redis.service";
import { TRIP_LOCATION, tripLocationBufferKey } from "../constants/trip.constants";
import type { Payload } from "../types/location";

@Injectable()
export class LocationHistoryService {
  constructor(
    @Inject(RedisService) private readonly redis: RedisService,
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  async append(payload: Payload): Promise<void> {
    if (!this.redis.isConfigured()) {
      return;
    }

    const key = tripLocationBufferKey(payload.tripId);
    const client = this.redis.getClient();
    const point = JSON.stringify({
      tripId: payload.tripId,
      driverId: payload.driverId,
      lat: payload.lat,
      lng: payload.lng,
      heading: payload.heading ?? null,
      speed: payload.speed ?? null,
      accuracy: payload.accuracy ?? null,
      recordedAt: new Date(payload.timestamp).toISOString(),
    });

    const len = await client.rpush(key, point);
    if (len >= TRIP_LOCATION.HISTORY_BATCH_SIZE) {
      await this.flush(payload.tripId);
    }
  }

  async flush(tripId: string): Promise<void> {
    if (!this.redis.isConfigured()) {
      return;
    }

    const key = tripLocationBufferKey(tripId);
    const client = this.redis.getClient();
    const raw = await client.lrange(key, 0, -1);
    if (raw.length === 0) {
      return;
    }

    await client.del(key);

    const rows = raw
      .map((item) => {
        try {
          const value = JSON.parse(item) as {
            tripId: string;
            driverId: string;
            lat: number;
            lng: number;
            heading: number | null;
            speed: number | null;
            accuracy: number | null;
            recordedAt: string;
          };
          return {
            id: randomUUID(),
            tripId: value.tripId,
            driverId: value.driverId,
            lat: value.lat,
            lng: value.lng,
            heading: value.heading,
            speed: value.speed,
            accuracy: value.accuracy,
            recordedAt: new Date(value.recordedAt),
          };
        } catch {
          return null;
        }
      })
      .filter((row): row is NonNullable<typeof row> => row !== null);

    if (rows.length === 0) {
      return;
    }

    await this.prisma.tripLocationPoint.createMany({ data: rows });
  }
}
