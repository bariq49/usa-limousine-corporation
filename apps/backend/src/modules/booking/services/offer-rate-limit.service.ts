import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { RedisService } from "../../../infrastructure/redis/redis.service";
import { OFFER_RATE_LIMITS, OFFER_REDIS } from "../constants/offer.constants";
import type { Consume } from "../types/offer-rate-limit";

@Injectable()
export class OfferRateLimitService {
  constructor(@Inject(RedisService) private readonly redis: RedisService) {}

  async consume(params: Consume): Promise<void> {
    if (!this.redis.isConfigured()) {
      return;
    }

    const window = params.windowSeconds ?? OFFER_RATE_LIMITS.windowSeconds;
    const redisKey = OFFER_REDIS.rate(params.bucket, params.key);
    const client = this.redis.getClient();
    const count = await client.incr(redisKey);
    if (count === 1) {
      await client.expire(redisKey, window);
    }
    if (count > params.limit) {
      const ttl = await client.ttl(redisKey);
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `Rate limit exceeded for ${params.bucket}`,
          retryAfterSeconds: ttl > 0 ? ttl : window,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  seek(ip: string) {
    return this.consume({
      bucket: "seek",
      key: ip || "unknown",
      limit: OFFER_RATE_LIMITS.seekPerIp,
    });
  }

  quote(driverId: string) {
    return this.consume({
      bucket: "quote",
      key: driverId,
      limit: OFFER_RATE_LIMITS.quotePerDriver,
    });
  }

  accept(userId: string) {
    return this.consume({
      bucket: "accept",
      key: userId,
      limit: OFFER_RATE_LIMITS.acceptPerToken,
    });
  }

  list(userId: string) {
    return this.consume({
      bucket: "list",
      key: userId,
      limit: OFFER_RATE_LIMITS.listPerToken,
    });
  }
}
