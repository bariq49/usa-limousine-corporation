import type { Request } from "express";
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { NotificationType, PayoutStatus } from "@prisma/client";
import { AppLogger } from "../../../common/logger/app.logger";
import { auditLog } from "../../../common/utils/audit-log";
import { toAmount } from "../../../common/utils/money";
import { allocateCode } from "../../../common/utils/allocate-sequence-code";
import { requireUserId, toRequestContext } from "../../../common/utils/to-request-context";
import { SequenceService } from "../../../infrastructure/sequence/sequence.service";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { NotificationService } from "../../notification/services/notification.service";
import { RecipientType } from "../../notification/types/notification";
import { SettingsRepository } from "../../settings/repositories/settings.repository";
import { WalletService } from "../../wallet/services/wallet.service";
import { STALE_PAYOUT_MS } from "../constants/payout.constants";
import type { QueryDto, RejectDto } from "../dto/payout.dto";
import { PayoutRepository } from "../repositories/payout.repository";
import { PayoutBankResolver } from "../services/payout-bank.resolver";
import type {
  CreateData,
  PayoutRecipient,
  ReconcileSummary,
  RequestPayout,
  ResolveBank,
  UpdateStatusData,
} from "../types/payout";

@Injectable()
export class PayoutService {
  constructor(
    @Inject(PayoutRepository) private readonly payouts: PayoutRepository,
    @Inject(PayoutBankResolver) private readonly bankResolver: PayoutBankResolver,
    @Inject(WalletService) private readonly walletService: WalletService,
    @Inject(SequenceService) private readonly sequences: SequenceService,
    @Inject(NotificationService) private readonly notifications: NotificationService,
    @Inject(SettingsRepository) private readonly settings: SettingsRepository,
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(AppLogger) private readonly logger: AppLogger,
  ) {}

  list(query: QueryDto) {
    return this.payouts.findMany(query);
  }

  async getOne(id: string) {
    const payout = await this.payouts.findById(id);
    if (!payout) {
      throw new NotFoundException("Payout not found");
    }

    return payout;
  }

  async request(params: RequestPayout, request: Request) {
    const context = toRequestContext(request);
    const userId = requireUserId(context);

    const platformSettings = await this.settings.get();
    const payoutMin = toAmount(platformSettings.payoutMin);
    if (params.amount < payoutMin) {
      throw new BadRequestException(`Minimum payout amount is ${payoutMin}`);
    }

    const lastPayout = await this.payouts.findLastByRecipient(params.recipient);
    if (lastPayout) {
      const intervalMs = platformSettings.payoutIntervalDays * 24 * 60 * 60 * 1000;
      const elapsedMs = Date.now() - lastPayout.createdAt.getTime();
      if (elapsedMs < intervalMs) {
        const daysRemaining = Math.ceil((intervalMs - elapsedMs) / (24 * 60 * 60 * 1000));
        throw new BadRequestException(`You can request another payout in ${daysRemaining} day(s)`);
      }
    }

    const resolveBank: ResolveBank = { recipient: params.recipient };
    if (params.bankAccountId !== undefined) {
      resolveBank.bankAccountId = params.bankAccountId;
    }

    const bankDestination = await this.bankResolver.resolve(resolveBank);

    const wallet = await this.walletService.ensure({
      ownerType: params.recipient.type,
      ownerId: params.recipient.id,
    });
    const balance = toAmount(wallet.balance);
    const reserved = await this.payouts.sumReservedAmount(params.recipient);
    const available = balance - reserved;

    if (params.amount > available) {
      throw new BadRequestException("Insufficient available wallet balance");
    }

    const payoutNumber = await allocateCode({
      prefix: "PO-",
      nextSequence: () => this.sequences.nextPayout(),
    });

    const data: CreateData = {
      recipient: params.recipient,
      amount: params.amount,
      bankAccountId: bankDestination.bankAccountId,
      accountHolderName: bankDestination.accountHolderName,
      iban: bankDestination.iban,
      bic: bankDestination.bic,
      bankName: bankDestination.bankName,
      payoutNumber,
      userId,
    };

    if (params.idempotencyKey !== undefined) {
      data.idempotencyKey = params.idempotencyKey;
    }
    if (params.notes !== undefined) {
      data.notes = params.notes;
    }

    const result = await this.payouts.create(data);

    if (result.created) {
      await this.notifications.notify({
        recipientType: RecipientType.DRIVER,
        recipientId: params.recipient.id,
        type: NotificationType.PAYOUT_SUBMITTED,
        title: "Payout requested",
        body: `Payout ${result.payout.payoutNumber} for ${toAmount(result.payout.amount)} is pending review.`,
        data: {
          type: "PAYOUT_SUBMITTED",
          payoutId: result.payout.id,
          payoutNumber: result.payout.payoutNumber,
          amount: toAmount(result.payout.amount),
          recipientType: params.recipient.type,
          recipientId: params.recipient.id,
        },
        push: true,
      });

      await auditLog({
        prisma: this.prisma,
        event: "payout.requested",
        result: "success",
        context,
        userId: context.userId,
        metadata: {
          payoutId: result.payout.id,
          payoutNumber: result.payout.payoutNumber,
          recipientType: params.recipient.type,
          recipientId: params.recipient.id,
          amount: toAmount(result.payout.amount),
        },
      });
    }

    return result.payout;
  }

  async approve(id: string, request: Request) {
    const context = toRequestContext(request);

    const existing = await this.payouts.findById(id);
    if (!existing) {
      throw new NotFoundException("Payout not found");
    }

    if (existing.status !== PayoutStatus.PENDING) {
      throw new ConflictException(`Cannot approve payout from ${existing.status}`);
    }

    const payout = await this.payouts.updateStatus(id, PayoutStatus.APPROVED);

    await this.notifications.notify({
      recipientType: RecipientType.DRIVER,
      recipientId: payout.recipientId,
      type: NotificationType.PAYOUT_APPROVED,
      title: "Payout approved",
      body: `Payout ${payout.payoutNumber} was approved and will be processed.`,
      data: {
        type: "PAYOUT_APPROVED",
        payoutId: payout.id,
        payoutNumber: payout.payoutNumber,
        amount: toAmount(payout.amount),
        recipientType: payout.recipientType,
        recipientId: payout.recipientId,
      },
      push: true,
    });

    await auditLog({
      prisma: this.prisma,
      event: "payout.approved",
      result: "success",
      context,
      userId: context.userId,
      metadata: { payoutId: payout.id, payoutNumber: payout.payoutNumber },
    });

    return payout;
  }

  async markProcessing(id: string, _request: Request) {
    const existing = await this.payouts.findById(id);
    if (!existing) {
      throw new NotFoundException("Payout not found");
    }

    if (existing.status !== PayoutStatus.APPROVED) {
      throw new ConflictException(`Cannot mark processing from ${existing.status}`);
    }

    return this.payouts.updateStatus(id, PayoutStatus.PROCESSING);
  }

  async markPaid(id: string, request: Request) {
    const context = toRequestContext(request);

    const existing = await this.payouts.findById(id);
    if (!existing) {
      throw new NotFoundException("Payout not found");
    }

    const wallet = await this.walletService.ensure({
      ownerType: existing.recipientType,
      ownerId: existing.recipientId,
    });

    const payoutRow = await this.payouts.settle(
      {
        payoutId: id,
        walletId: wallet.id,
      },
      `Payout ${existing.payoutNumber}`,
    );

    if (!payoutRow) {
      throw new ConflictException("Payout cannot be marked paid in its current state");
    }

    await this.notifications.notify({
      recipientType: RecipientType.DRIVER,
      recipientId: payoutRow.recipientId,
      type: NotificationType.PAYOUT_PAID,
      title: "Payout completed",
      body: `Payout ${payoutRow.payoutNumber} for ${toAmount(payoutRow.amount)} has been paid.`,
      data: {
        type: "PAYOUT_PAID",
        payoutId: payoutRow.id,
        payoutNumber: payoutRow.payoutNumber,
        amount: toAmount(payoutRow.amount),
        recipientType: payoutRow.recipientType,
        recipientId: payoutRow.recipientId,
      },
      push: true,
    });

    await auditLog({
      prisma: this.prisma,
      event: "payout.paid",
      result: "success",
      context,
      userId: context.userId,
      metadata: {
        payoutId: payoutRow.id,
        payoutNumber: payoutRow.payoutNumber,
        amount: toAmount(payoutRow.amount),
      },
    });

    return payoutRow;
  }

  async reject(id: string, body: RejectDto, request: Request) {
    const context = toRequestContext(request);

    const existing = await this.payouts.findById(id);
    if (!existing) {
      throw new NotFoundException("Payout not found");
    }

    if (
      existing.status !== PayoutStatus.PENDING &&
      existing.status !== PayoutStatus.APPROVED &&
      existing.status !== PayoutStatus.PROCESSING
    ) {
      throw new ConflictException(`Cannot reject payout from ${existing.status}`);
    }

    const updateData: UpdateStatusData = {
      failureReason: body.reason,
    };
    if (body.notes !== undefined) {
      updateData.notes = body.notes;
    }

    const payout = await this.payouts.updateStatus(id, PayoutStatus.REJECTED, updateData);

    await this.notifications.notify({
      recipientType: RecipientType.DRIVER,
      recipientId: payout.recipientId,
      type: NotificationType.PAYOUT_REJECTED,
      title: "Payout rejected",
      body: `Payout ${payout.payoutNumber} was rejected.`,
      data: {
        type: "PAYOUT_REJECTED",
        payoutId: payout.id,
        payoutNumber: payout.payoutNumber,
        amount: toAmount(payout.amount),
        recipientType: payout.recipientType,
        recipientId: payout.recipientId,
        reason: body.reason,
      },
      push: true,
    });

    await auditLog({
      prisma: this.prisma,
      event: "payout.rejected",
      result: "success",
      context,
      userId: context.userId,
      metadata: { payoutId: payout.id, payoutNumber: payout.payoutNumber, reason: body.reason },
    });

    return payout;
  }

  async cancel(id: string, recipient: PayoutRecipient, request: Request) {
    const context = toRequestContext(request);

    const existing = await this.payouts.findById(id);
    if (
      !existing ||
      existing.recipientType !== recipient.type ||
      existing.recipientId !== recipient.id
    ) {
      throw new NotFoundException("Payout not found");
    }

    if (existing.status !== PayoutStatus.PENDING) {
      throw new ConflictException(`Cannot cancel payout from ${existing.status}`);
    }

    const payout = await this.payouts.updateStatus(id, PayoutStatus.CANCELLED);

    await this.notifications.notify({
      recipientType: RecipientType.DRIVER,
      recipientId: payout.recipientId,
      type: NotificationType.PAYOUT_CANCELLED,
      title: "Payout cancelled",
      body: `Payout ${payout.payoutNumber} was cancelled.`,
      data: {
        type: "PAYOUT_CANCELLED",
        payoutId: payout.id,
        payoutNumber: payout.payoutNumber,
        amount: toAmount(payout.amount),
        recipientType: payout.recipientType,
        recipientId: payout.recipientId,
      },
      push: false,
    });

    await auditLog({
      prisma: this.prisma,
      event: "payout.cancelled",
      result: "success",
      context,
      userId: context.userId,
      metadata: { payoutId: payout.id, payoutNumber: payout.payoutNumber },
    });

    return payout;
  }

  async reconcile(now: Date = new Date()): Promise<ReconcileSummary> {
    const olderThan = new Date(now.getTime() - STALE_PAYOUT_MS);
    const staleApproved = await this.payouts.countStale(olderThan);
    const paidWithoutDebit = await this.payouts.countUnsettled();
    let overReserved = 0;

    const reservedByRecipient = await this.payouts.groupReservedByRecipient();
    for (const row of reservedByRecipient) {
      const wallet = await this.walletService.findByOwner({
        ownerType: row.recipientType,
        ownerId: row.recipientId,
      });
      const balance = wallet ? toAmount(wallet.balance) : 0;
      const reserved = toAmount(row._sum.amount ?? 0);
      if (reserved > balance) {
        overReserved += 1;
      }
    }

    if (staleApproved > 0 || paidWithoutDebit > 0 || overReserved > 0) {
      this.logger.warn(
        `Payout reconcile: staleApproved=${staleApproved} paidWithoutDebit=${paidWithoutDebit} overReserved=${overReserved}`,
        PayoutService.name,
      );
    }

    const repairCandidates = await this.payouts.findUnsettled(20);
    for (const payout of repairCandidates) {
      try {
        const wallet = await this.walletService.ensure({
          ownerType: payout.recipientType,
          ownerId: payout.recipientId,
        });
        await this.payouts.settle(
          {
            payoutId: payout.id,
            walletId: wallet.id,
          },
          `Payout ${payout.payoutNumber} (reconcile repair)`,
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(
          `Payout reconcile repair failed for ${payout.id}: ${message}`,
          PayoutService.name,
        );
      }
    }

    return { staleApproved, paidWithoutDebit, overReserved };
  }
}
