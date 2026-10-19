import { Inject, Injectable } from "@nestjs/common";
import { AppLogger } from "../../../common/logger/app.logger";
import { RedisService } from "../../../infrastructure/redis/redis.service";
import { OFFER_REDIS } from "../constants/offer.constants";

type MetricName =
  | "seek_started"
  | "match_dispatched"
  | "match_candidates"
  | "match_ms"
  | "quote_created"
  | "quote_rejected"
  | "accept_ok"
  | "accept_conflict"
  | "accept_ms"
  | "payment_fulfilled"
  | "payment_failed_reopen"
  | "payment_timeout_reopen"
  | "session_expired"
  | "offer_expired";

@Injectable()
export class OfferMetricsService {
  constructor(
    @Inject(RedisService) private readonly redis: RedisService,
    @Inject(AppLogger) private readonly logger: AppLogger,
  ) {}

  async incr(name: MetricName, by = 1): Promise<void> {
    this.logger.debug(`offer.metric ${name}=+${by}`, OfferMetricsService.name);
    if (!this.redis.isConfigured()) {
      return;
    }
    try {
      const key = OFFER_REDIS.metrics(name);
      const client = this.redis.getClient();
      await client.incrby(key, by);
      await client.expire(key, 7 * 24 * 60 * 60);
    } catch {
      // metrics must never break the hot path
    }
  }

  async timing(name: MetricName, ms: number): Promise<void> {
    this.logger.debug(`offer.metric ${name}=${Math.round(ms)}ms`, OfferMetricsService.name);
    if (!this.redis.isConfigured()) {
      return;
    }
    try {
      const client = this.redis.getClient();
      const sumKey = OFFER_REDIS.metrics(`${name}:sum`);
      const countKey = OFFER_REDIS.metrics(`${name}:count`);
      await client.incrbyfloat(sumKey, ms);
      await client.incr(countKey);
      await client.expire(sumKey, 7 * 24 * 60 * 60);
      await client.expire(countKey, 7 * 24 * 60 * 60);
    } catch {
      // ignore
    }
  }

  async snapshot(): Promise<Record<string, number>> {
    if (!this.redis.isConfigured()) {
      return {};
    }
    const names: MetricName[] = [
      "seek_started",
      "match_dispatched",
      "match_candidates",
      "quote_created",
      "quote_rejected",
      "accept_ok",
      "accept_conflict",
      "payment_fulfilled",
      "payment_failed_reopen",
      "payment_timeout_reopen",
      "session_expired",
      "offer_expired",
    ];
    const client = this.redis.getClient();
    const out: Record<string, number> = {};
    for (const name of names) {
      const raw = await client.get(OFFER_REDIS.metrics(name));
      out[name] = raw ? Number(raw) : 0;
    }
    return out;
  }
}
