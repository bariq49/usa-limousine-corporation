import { Inject, Injectable } from "@nestjs/common";
import { NoticeUnit, type PlatformSettings } from "@prisma/client";
import type { Request } from "express";
import { auditLog } from "../../../common/utils/audit-log";
import { toAmount } from "../../../common/utils/money";
import { toRequestContext } from "../../../common/utils/to-request-context";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import type { UpdateDto } from "../dto/update.dto";
import { PlatformSettingsRepository } from "../repositories/platform-settings.repository";
import type { PlatformRates } from "../types/platform-settings";

function toRates(row: PlatformSettings): PlatformRates {
  return {
    paymentMode: row.paymentMode,
    fuelSurchargeRate: toAmount(row.fuelSurchargeRate),
    gratuityRate: toAmount(row.gratuityRate),
    taxRate: toAmount(row.taxRate),
    transactionFeeRate: toAmount(row.transactionFeeRate),
    oneWayDiscountRate: toAmount(row.oneWayDiscountRate),
    returnDiscountRate: toAmount(row.returnDiscountRate),
    airportPickupFee: toAmount(row.airportPickupFee),
    stopFee: toAmount(row.stopFee),
    meetAndGreetFee: toAmount(row.meetAndGreetFee),
    minBookingNotice: row.minBookingNotice,
    minBookingNoticeUnit: row.minBookingNoticeUnit,
    minBookingMinutes:
      row.minBookingNoticeUnit === NoticeUnit.HOUR
        ? row.minBookingNotice * 60
        : row.minBookingNotice,
    cancellationNotice: row.cancellationNotice,
    cancellationNoticeUnit: row.cancellationNoticeUnit,
    cancellationMinutes:
      row.cancellationNoticeUnit === NoticeUnit.HOUR
        ? row.cancellationNotice * 60
        : row.cancellationNotice,
    cancellationRefundRate: toAmount(row.cancellationRefundRate),
  };
}

@Injectable()
export class PlatformSettingsService {
  constructor(
    @Inject(PlatformSettingsRepository)
    private readonly repository: PlatformSettingsRepository,
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  /** Current fees and rules as numbers; used by pricing and returned to clients. */
  async get(): Promise<PlatformRates> {
    return toRates(await this.repository.get());
  }

  async update(body: UpdateDto, request: Request): Promise<PlatformRates> {
    const context = toRequestContext(request);
    const settings = toRates(await this.repository.update(body));

    await auditLog({
      prisma: this.prisma,
      event: "platform_settings.updated",
      result: "success",
      context,
      userId: context.userId,
      metadata: { fields: Object.keys(body) },
    });

    return settings;
  }
}
