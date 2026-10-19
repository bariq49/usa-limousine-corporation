import { DriverGeoService } from "../src/modules/driver/services/geo.service";
import { RedisService } from "../src/infrastructure/redis/redis.service";
import { ConfigService } from "@nestjs/config";
import type { AppLogger } from "../src/common/logger/app.logger";

/**
 * Live Redis GEO smoke — runs against the configured Redis when available.
 * Skips when REDIS_URL is unset (CI / local without Redis).
 */
describe("Offer matching live Redis GEO", () => {
  const redisUrl = process.env["REDIS_URL"];
  const logger = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  } as unknown as AppLogger;

  let redis: RedisService | null = null;
  let geo: DriverGeoService | null = null;
  const categoryId = `live-cat-${Date.now()}`;
  const driverNear = `live-driver-near-${Date.now()}`;
  const driverFar = `live-driver-far-${Date.now()}`;

  beforeAll(async () => {
    if (!redisUrl) {
      return;
    }

    const config = new ConfigService({ REDIS_URL: redisUrl });
    redis = new RedisService(config, logger);
    try {
      await redis.onModuleInit();
      geo = new DriverGeoService(redis);
    } catch {
      await redis.onModuleDestroy().catch(() => undefined);
      redis = null;
      geo = null;
    }
  });

  afterAll(async () => {
    if (redis?.isConfigured() && geo) {
      await geo.remove({ driverId: driverNear, categoryId });
      await geo.remove({ driverId: driverFar, categoryId });
    }
    await redis?.onModuleDestroy();
  });

  it("returns nearby drivers within radius and excludes far ones", async () => {
    if (!redis?.isConfigured() || !geo) {
      return;
    }

    // Schiphol-ish
    await geo.upsert({
      driverId: driverNear,
      lat: 52.3105,
      lng: 4.7683,
      categoryId,
    });
    // Far: Rotterdam-ish
    await geo.upsert({
      driverId: driverFar,
      lat: 51.9225,
      lng: 4.4792,
      categoryId,
    });

    const nearby = await geo.searchNearby({
      lat: 52.3105,
      lng: 4.7683,
      radius: 5,
      categoryId,
      count: 20,
    });

    const ids = nearby.map((n) => n.driverId);
    expect(ids).toContain(driverNear);
    expect(ids).not.toContain(driverFar);
  });
});
