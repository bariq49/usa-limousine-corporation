import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import type { Request } from "express";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { auditLog } from "../../../common/utils/audit-log";
import { toRequestContext } from "../../../common/utils/to-request-context";
import { toAmount } from "../../../common/utils/money";
import type { UpdateDto } from "../dto/settings.dto";
import { SettingsRepository } from "../repositories/settings.repository";

@Injectable()
export class SettingsService {
  constructor(
    @Inject(SettingsRepository) private readonly settings: SettingsRepository,
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  async get() {
    const settings = await this.settings.get();
    return {
      paymentMode: settings.paymentMode,
      payoutMin: toAmount(settings.payoutMin),
      payoutIntervalDays: settings.payoutIntervalDays,
      requireSubscription: settings.requireSubscription,
      offerRadius: settings.offerRadius,
      offerExpandStep: settings.offerExpandStep,
      offerExpandMax: settings.offerExpandMax,
      offerGeoMatchCount: settings.offerGeoMatchCount,
      offerMaxPerBooking: settings.offerMaxPerBooking,
      offerMaxQuotesPerDriver: settings.offerMaxQuotesPerDriver,
      offerTtlMin: settings.offerTtlMin,
      offerSessionTtlMin: settings.offerSessionTtlMin,
      offerQuoteMinFactor: settings.offerQuoteMinFactor,
      offerQuoteMaxFactor: settings.offerQuoteMaxFactor,
      paymentTimeoutMin: settings.paymentTimeoutMin,
      cancelRefundBeforeStartPercent: settings.cancelRefundBeforeStartPercent,
      cancelRefundAfterStartPercent: settings.cancelRefundAfterStartPercent,
      driverCancelRefundPercent: settings.driverCancelRefundPercent,
      driverCancelReseek: settings.driverCancelReseek,
      pickupFreeWaitMin: settings.pickupFreeWaitMin,
      noShowRefundPercent: settings.noShowRefundPercent,
      updatedAt: settings.updatedAt,
    };
  }

  async update(body: UpdateDto, request: Request) {
    const context = toRequestContext(request);
    const current = await this.settings.get();

    const data = {
      paymentMode: body.paymentMode ?? current.paymentMode,
      payoutMin: body.payoutMin ?? toAmount(current.payoutMin),
      payoutIntervalDays: body.payoutIntervalDays ?? current.payoutIntervalDays,
      requireSubscription: body.requireSubscription ?? current.requireSubscription,
      offerRadius: body.offerRadius ?? current.offerRadius,
      offerExpandStep: body.offerExpandStep ?? current.offerExpandStep,
      offerExpandMax: body.offerExpandMax ?? current.offerExpandMax,
      offerGeoMatchCount: body.offerGeoMatchCount ?? current.offerGeoMatchCount,
      offerMaxPerBooking: body.offerMaxPerBooking ?? current.offerMaxPerBooking,
      offerMaxQuotesPerDriver: body.offerMaxQuotesPerDriver ?? current.offerMaxQuotesPerDriver,
      offerTtlMin: body.offerTtlMin ?? current.offerTtlMin,
      offerSessionTtlMin: body.offerSessionTtlMin ?? current.offerSessionTtlMin,
      offerQuoteMinFactor: body.offerQuoteMinFactor ?? current.offerQuoteMinFactor,
      offerQuoteMaxFactor: body.offerQuoteMaxFactor ?? current.offerQuoteMaxFactor,
      paymentTimeoutMin: body.paymentTimeoutMin ?? current.paymentTimeoutMin,
      cancelRefundBeforeStartPercent:
        body.cancelRefundBeforeStartPercent ?? current.cancelRefundBeforeStartPercent,
      cancelRefundAfterStartPercent:
        body.cancelRefundAfterStartPercent ?? current.cancelRefundAfterStartPercent,
      driverCancelRefundPercent:
        body.driverCancelRefundPercent ?? current.driverCancelRefundPercent,
      driverCancelReseek: body.driverCancelReseek ?? current.driverCancelReseek,
      pickupFreeWaitMin: body.pickupFreeWaitMin ?? current.pickupFreeWaitMin,
      noShowRefundPercent: body.noShowRefundPercent ?? current.noShowRefundPercent,
    };

    if (data.offerExpandMax < data.offerRadius) {
      throw new BadRequestException("offerExpandMax must be greater than or equal to offerRadius");
    }
    if (data.offerQuoteMaxFactor <= data.offerQuoteMinFactor) {
      throw new BadRequestException("offerQuoteMaxFactor must be greater than offerQuoteMinFactor");
    }
    if (data.offerSessionTtlMin < data.offerTtlMin) {
      throw new BadRequestException("offerSessionTtlMin should be at least offerTtlMin");
    }

    const settings = await this.settings.update(data);
    const response = {
      paymentMode: settings.paymentMode,
      payoutMin: toAmount(settings.payoutMin),
      payoutIntervalDays: settings.payoutIntervalDays,
      requireSubscription: settings.requireSubscription,
      offerRadius: settings.offerRadius,
      offerExpandStep: settings.offerExpandStep,
      offerExpandMax: settings.offerExpandMax,
      offerGeoMatchCount: settings.offerGeoMatchCount,
      offerMaxPerBooking: settings.offerMaxPerBooking,
      offerMaxQuotesPerDriver: settings.offerMaxQuotesPerDriver,
      offerTtlMin: settings.offerTtlMin,
      offerSessionTtlMin: settings.offerSessionTtlMin,
      offerQuoteMinFactor: settings.offerQuoteMinFactor,
      offerQuoteMaxFactor: settings.offerQuoteMaxFactor,
      paymentTimeoutMin: settings.paymentTimeoutMin,
      cancelRefundBeforeStartPercent: settings.cancelRefundBeforeStartPercent,
      cancelRefundAfterStartPercent: settings.cancelRefundAfterStartPercent,
      driverCancelRefundPercent: settings.driverCancelRefundPercent,
      driverCancelReseek: settings.driverCancelReseek,
      pickupFreeWaitMin: settings.pickupFreeWaitMin,
      noShowRefundPercent: settings.noShowRefundPercent,
      updatedAt: settings.updatedAt,
    };

    await auditLog({
      prisma: this.prisma,
      event: "settings.updated",
      result: "success",
      context,
      userId: context.userId,
      metadata: response,
    });

    return response;
  }

  async clearData() {
    await this.prisma.$executeRawUnsafe(`TRUNCATE TABLE "Booking", "Driver" CASCADE;`);

    return {
      success: true,
      message: "Successfully deleted all bookings, drivers, and related data.",
    };
  }
}
