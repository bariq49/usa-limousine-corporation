import { Inject, Injectable } from "@nestjs/common";
import { RedisService } from "../../../infrastructure/redis/redis.service";
import { OFFER_REDIS } from "../../booking/constants/offer.constants";
import type { Busy, FilterBusy, Nearby, Remove, SearchNearby, Upsert } from "../types/geo";

export const DRIVERS_GEO_KEY = "drivers:geo";

export type { Nearby } from "../types/geo";

@Injectable()
export class DriverGeoService {
  constructor(@Inject(RedisService) private readonly redis: RedisService) {}

  async upsert(props: Upsert): Promise<void> {
    const { driverId, lat, lng, categoryId } = props;
    if (!this.redis.isConfigured()) {
      return;
    }

    const client = this.redis.getClient();
    const pipeline = client.pipeline();
    pipeline.geoadd(DRIVERS_GEO_KEY, lng, lat, driverId);
    if (categoryId) {
      pipeline.geoadd(OFFER_REDIS.geoCategory(categoryId), lng, lat, driverId);
    }
    await pipeline.exec();
  }

  async remove(props: Remove): Promise<void> {
    const { driverId, categoryId } = props;
    if (!this.redis.isConfigured()) {
      return;
    }

    const client = this.redis.getClient();
    const pipeline = client.pipeline();
    pipeline.zrem(DRIVERS_GEO_KEY, driverId);
    if (categoryId) {
      pipeline.zrem(OFFER_REDIS.geoCategory(categoryId), driverId);
    }
    await pipeline.exec();
  }

  async searchNearby(props: SearchNearby): Promise<Nearby[]> {
    const { lat, lng, radius, categoryId, count } = props;
    if (!this.redis.isConfigured()) {
      return [];
    }

    const client = this.redis.getClient();
    const key = categoryId ? OFFER_REDIS.geoCategory(categoryId) : DRIVERS_GEO_KEY;

    try {
      const rows = (await client.call(
        "GEOSEARCH",
        key,
        "FROMLONLAT",
        String(lng),
        String(lat),
        "BYRADIUS",
        String(radius),
        "km",
        "ASC",
        "COUNT",
        String(count),
        "WITHDIST",
      )) as Array<[string, string]> | null;

      if (!rows?.length) {
        if (categoryId) {
          return this.searchNearby({ lat, lng, radius, count });
        }
        return [];
      }

      return rows.map(([driverId, dist]) => ({
        driverId,
        distance: Number(dist),
      }));
    } catch {
      const rows = (await client.georadius(
        key,
        lng,
        lat,
        radius,
        "km",
        "WITHDIST",
        "ASC",
        "COUNT",
        count,
      )) as Array<[string, string]> | null;

      if (!rows?.length) {
        if (categoryId) {
          return this.searchNearby({ lat, lng, radius, count });
        }
        return [];
      }

      return rows.map(([driverId, dist]) => ({
        driverId,
        distance: Number(dist),
      }));
    }
  }

  async markBusy(props: Busy): Promise<void> {
    const { driverId } = props;
    if (!this.redis.isConfigured()) {
      return;
    }
    await this.redis.getClient().sadd(OFFER_REDIS.busy, driverId);
  }

  async markFree(props: Busy): Promise<void> {
    const { driverId } = props;
    if (!this.redis.isConfigured()) {
      return;
    }
    await this.redis.getClient().srem(OFFER_REDIS.busy, driverId);
  }

  async filterBusy(props: FilterBusy): Promise<string[]> {
    const { driverIds } = props;
    if (driverIds.length === 0 || !this.redis.isConfigured()) {
      return driverIds;
    }

    const client = this.redis.getClient();
    const pipeline = client.pipeline();
    for (const id of driverIds) {
      pipeline.sismember(OFFER_REDIS.busy, id);
    }
    const results = await pipeline.exec();
    if (!results) {
      return driverIds;
    }

    return driverIds.filter((_, index) => {
      const row = results[index];
      return !row || row[0] || row[1] !== 1;
    });
  }
}
