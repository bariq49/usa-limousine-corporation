import { HttpException } from "@nestjs/common";
import { OfferRateLimitService } from "../src/modules/booking/services/offer-rate-limit.service";

describe("OfferRateLimitService", () => {
  it("allows under the limit and blocks over", async () => {
    const counts = new Map<string, number>();
    const client = {
      incr: jest.fn(async (key: string) => {
        const next = (counts.get(key) ?? 0) + 1;
        counts.set(key, next);
        return next;
      }),
      expire: jest.fn(async () => 1),
      ttl: jest.fn(async () => 30),
    };

    const service = new OfferRateLimitService({
      isConfigured: () => true,
      getClient: () => client,
    } as never);

    await service.consume({ bucket: "quote", key: "d1", limit: 2 });
    await service.consume({ bucket: "quote", key: "d1", limit: 2 });
    await expect(service.consume({ bucket: "quote", key: "d1", limit: 2 })).rejects.toBeInstanceOf(
      HttpException,
    );
  });

  it("no-ops when Redis is down", async () => {
    const service = new OfferRateLimitService({
      isConfigured: () => false,
      getClient: () => {
        throw new Error("no redis");
      },
    } as never);
    await expect(service.quote("d1")).resolves.toBeUndefined();
  });
});
