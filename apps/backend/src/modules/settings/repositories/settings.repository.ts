import { Inject, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { AppLogger } from "../../../common/logger/app.logger";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { RedisService } from "../../../infrastructure/redis/redis.service";
import type { CancelPolicySettings, OfferMarketplaceSettings, UpdateData } from "../types/settings";

const GLOBAL_ID = "global";
const CACHE_KEY = "cache:platformSettings:v4";

@Injectable()
export class SettingsRepository {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(RedisService) private readonly redis: RedisService,
    @Inject(AppLogger) private readonly logger: AppLogger,
  ) {}

  async get() {
    if (this.redis.isConfigured()) {
      try {
        const cached = await this.redis.getClient().get(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (
            typeof parsed.offerRadius === "number" &&
            typeof parsed.paymentTimeoutMin === "number"
          ) {
            return {
              id: parsed.id,
              paymentMode: parsed.paymentMode,
              payoutMin: new Prisma.Decimal(parsed.payoutMin),
              payoutIntervalDays: parsed.payoutIntervalDays,
              requireSubscription: parsed.requireSubscription,
              offerRadius: parsed.offerRadius,
              offerExpandStep: parsed.offerExpandStep,
              offerExpandMax: parsed.offerExpandMax,
              offerGeoMatchCount: parsed.offerGeoMatchCount,
              offerMaxPerBooking: parsed.offerMaxPerBooking,
              offerMaxQuotesPerDriver: parsed.offerMaxQuotesPerDriver,
              offerTtlMin: parsed.offerTtlMin,
              offerSessionTtlMin: parsed.offerSessionTtlMin,
              offerQuoteMinFactor: parsed.offerQuoteMinFactor,
              offerQuoteMaxFactor: parsed.offerQuoteMaxFactor,
              paymentTimeoutMin: parsed.paymentTimeoutMin,
              cancelRefundBeforeStartPercent: parsed.cancelRefundBeforeStartPercent,
              cancelRefundAfterStartPercent: parsed.cancelRefundAfterStartPercent,
              driverCancelRefundPercent: parsed.driverCancelRefundPercent,
              driverCancelReseek: parsed.driverCancelReseek,
              pickupFreeWaitMin: parsed.pickupFreeWaitMin,
              noShowRefundPercent: parsed.noShowRefundPercent,
              createdAt: new Date(parsed.createdAt),
              updatedAt: new Date(parsed.updatedAt),
            };
          }
        }
      } catch (error) {
        this.logger.error(
          "Failed to read from Redis cache, falling back to DB",
          error as Error,
          SettingsRepository.name,
        );
      }
    }

    const existing = await this.prisma.platformSettings.findUnique({
      where: { id: GLOBAL_ID },
    });

    const result = existing
      ? existing
      : await this.prisma.platformSettings.create({
          data: { id: GLOBAL_ID },
        });

    if (this.redis.isConfigured()) {
      try {
        await this.redis.getClient().set(CACHE_KEY, JSON.stringify(result));
      } catch (error) {
        this.logger.error(
          "Failed to write to Redis cache",
          error as Error,
          SettingsRepository.name,
        );
      }
    }

    return result;
  }

  async getOfferMarketplace(): Promise<OfferMarketplaceSettings> {
    const s = await this.get();
    return {
      radius: s.offerRadius,
      expandStep: s.offerExpandStep,
      expandMax: s.offerExpandMax,
      geoMatchCount: s.offerGeoMatchCount,
      maxPerBooking: s.offerMaxPerBooking,
      maxQuotesPerDriver: s.offerMaxQuotesPerDriver,
      ttlMin: s.offerTtlMin,
      sessionTtlMin: s.offerSessionTtlMin,
      quoteMinFactor: s.offerQuoteMinFactor,
      quoteMaxFactor: s.offerQuoteMaxFactor,
    };
  }

  async getCancelPolicy(): Promise<CancelPolicySettings> {
    const s = await this.get();
    return {
      paymentTimeoutMin: s.paymentTimeoutMin,
      cancelRefundBeforeStartPercent: s.cancelRefundBeforeStartPercent,
      cancelRefundAfterStartPercent: s.cancelRefundAfterStartPercent,
      driverCancelRefundPercent: s.driverCancelRefundPercent,
      driverCancelReseek: s.driverCancelReseek,
      pickupFreeWaitMin: s.pickupFreeWaitMin,
      noShowRefundPercent: s.noShowRefundPercent,
    };
  }

  async update(data: UpdateData) {
    const updated = await this.prisma.platformSettings.upsert({
      where: { id: GLOBAL_ID },
      create: {
        id: GLOBAL_ID,
        ...data,
      },
      update: { ...data },
    });

    if (this.redis.isConfigured()) {
      try {
        await this.redis.getClient().del(CACHE_KEY);
        await this.redis.getClient().del("cache:platformSettings");
        await this.redis.getClient().del("cache:platformSettings:v2");
        await this.redis.getClient().del("cache:platformSettings:v3");
      } catch (error) {
        this.logger.error(
          "Failed to invalidate Redis cache",
          error as Error,
          SettingsRepository.name,
        );
      }
    }

    return updated;
  }
}
