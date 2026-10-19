import { Inject, Injectable } from "@nestjs/common";
import { WalletOwnerType } from "@prisma/client";
import type { Request } from "express";
import { roundAmount, toAmount } from "../../../common/utils/money";
import { PayoutRepository } from "../../payout/repositories/payout.repository";
import { SettingsRepository } from "../../settings/repositories/settings.repository";
import { WalletService } from "../../wallet/services/wallet.service";
import { DriverBankAccountRepository } from "../repositories/bank-account.repository";
import { DriverRepository } from "../repositories/driver.repository";
import type { WalletSummary, WalletSummaryRecipient } from "../types/wallet-summary";
import { requireDriver } from "../utils/require-driver";

@Injectable()
export class DriverWalletSummaryService {
  constructor(
    @Inject(DriverRepository) private readonly driverRepository: DriverRepository,
    @Inject(WalletService) private readonly walletService: WalletService,
    @Inject(PayoutRepository) private readonly payoutRepository: PayoutRepository,
    @Inject(SettingsRepository) private readonly settingsRepository: SettingsRepository,
    @Inject(DriverBankAccountRepository)
    private readonly bankAccountRepository: DriverBankAccountRepository,
  ) {}

  async getSummary(request: Request): Promise<WalletSummary> {
    const driver = await requireDriver(this.driverRepository, request);
    return this.summary({
      type: WalletOwnerType.DRIVER,
      id: driver.id,
    });
  }

  async summary(recipient: WalletSummaryRecipient): Promise<WalletSummary> {
    const wallet = await this.walletService.findByOwner({
      ownerType: recipient.type,
      ownerId: recipient.id,
    });

    const walletBalance = wallet ? toAmount(wallet.balance) : 0;
    const totalEarned = wallet ? await this.walletService.sumCredits(wallet.id) : 0;
    const paidOut = wallet ? await this.walletService.sumDebits(wallet.id) : 0;
    const processing = await this.payoutRepository.sumReservedAmount({
      type: recipient.type,
      id: recipient.id,
    });
    const available = roundAmount(Math.max(walletBalance - processing, 0));

    const platformSettings = await this.settingsRepository.get();
    const payoutMin = toAmount(platformSettings.payoutMin);
    const payoutIntervalDays = platformSettings.payoutIntervalDays;

    const hasBankAccount =
      recipient.type === WalletOwnerType.DRIVER
        ? (await this.bankAccountRepository.list(recipient.id)).length > 0
        : false;

    let canRequestPayout = hasBankAccount && available >= payoutMin && available > 0;

    if (canRequestPayout) {
      const lastPayout = await this.payoutRepository.findLastByRecipient({
        type: recipient.type,
        id: recipient.id,
      });
      if (lastPayout) {
        const intervalMs = payoutIntervalDays * 24 * 60 * 60 * 1000;
        const elapsedMs = Date.now() - lastPayout.createdAt.getTime();
        if (elapsedMs < intervalMs) {
          canRequestPayout = false;
        }
      }
    }

    return {
      walletBalance,
      totalEarned,
      paidOut,
      available,
      processing,
      payoutMin,
      payoutIntervalDays,
      hasBankAccount,
      canRequestPayout,
    };
  }
}
