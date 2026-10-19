import { OfferCacheService } from "../src/modules/booking/services/offer-cache.service";

describe("OfferCacheService", () => {
  it("tryLock allows first offer and rejects a different second offer", async () => {
    const store = new Map<string, string>();
    const client = {
      set: jest.fn(async (key: string, value: string, _ex: string, _ttl: number, nx: string) => {
        if (nx === "NX" && store.has(key)) {
          return null;
        }
        store.set(key, value);
        return "OK";
      }),
      get: jest.fn(async (key: string) => store.get(key) ?? null),
      del: jest.fn(async (key: string) => {
        store.delete(key);
        return 1;
      }),
    };

    const service = new OfferCacheService({
      isConfigured: () => true,
      getClient: () => client,
    } as never);

    await expect(service.tryLock({ bookingId: "book1", offerId: "offer-a" })).resolves.toBe(true);
    await expect(service.tryLock({ bookingId: "book1", offerId: "offer-b" })).resolves.toBe(false);
    await expect(service.tryLock({ bookingId: "book1", offerId: "offer-a" })).resolves.toBe(true);
  });

  it("no-ops gracefully when Redis is not configured", async () => {
    const service = new OfferCacheService({
      isConfigured: () => false,
      getClient: () => {
        throw new Error("should not call");
      },
    } as never);

    await expect(service.tryLock({ bookingId: "book1", offerId: "offer-a" })).resolves.toBe(true);
    await expect(
      service.putSession({
        bookingId: "book1",
        bookingNumber: "BK-1",
        status: "SEEKING_OFFERS",
        vehicleCategoryId: "cat1",
        fairPrice: 100,
        pickupLat: 0,
        pickupLng: 0,
        expiresAt: new Date().toISOString(),
        userId: "user1",
        matchingRadius: 8,
        ttlSeconds: 10,
      }),
    ).resolves.toBeUndefined();
  });
});
