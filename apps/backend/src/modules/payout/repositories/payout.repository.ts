import { Inject, Injectable } from "@nestjs/common";
import {
  PayoutLifecycleEvent,
  PayoutStatus,
  WalletTransactionType,
  type Prisma,
} from "@prisma/client";
import { APIFeature } from "../../../common/api-feature";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { roundAmount, toAmount } from "../../../common/utils/money";
import type { QueryDto } from "../dto/payout.dto";
import type {
  CreateData,
  PayoutRecipient,
  SettleData,
  StatusUpdate,
  UpdateStatusData,
} from "../types/payout";

type EventCreate = Prisma.PayoutEventUncheckedCreateInput;
type PayoutUpdate = Prisma.PayoutUpdateInput;

@Injectable()
export class PayoutRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  findMany(query: QueryDto) {
    const feature = new APIFeature(query, {
      filterFields: ["status", "recipientType", "recipientId", "payoutNumber"],
      search: {
        searchFields: ["payoutNumber", "id", "iban", "accountHolderName"],
      },
      sort: {
        allowedFields: ["createdAt", "updatedAt", "amount", "status", "paidAt"],
        defaultSortBy: "createdAt",
        defaultSortOrder: "desc",
      },
      pagination: {
        defaultLimit: 20,
        maxLimit: 100,
      },
      dateRange: {
        field: "createdAt",
      },
    });

    return feature.execute({
      findMany: (args) =>
        this.prisma.payout.findMany({
          where: args.where as never,
          orderBy: args.orderBy as never,
          skip: args.skip,
          take: args.take,
        }),
      count: ({ where }) => this.prisma.payout.count({ where: where as never }),
    });
  }

  findById(id: string) {
    return this.prisma.payout.findUnique({
      where: { id },
    });
  }

  findByIdempotencyKey(idempotencyKey: string) {
    return this.prisma.payout.findUnique({
      where: { idempotencyKey },
    });
  }

  findLastByRecipient(recipient: PayoutRecipient) {
    return this.prisma.payout.findFirst({
      where: {
        recipientType: recipient.type,
        recipientId: recipient.id,
        status: { not: PayoutStatus.CANCELLED },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async sumReservedAmount(recipient: PayoutRecipient) {
    const result = await this.prisma.payout.aggregate({
      where: {
        recipientType: recipient.type,
        recipientId: recipient.id,
        status: {
          in: [PayoutStatus.PENDING, PayoutStatus.APPROVED, PayoutStatus.PROCESSING],
        },
      },
      _sum: { amount: true },
    });

    return toAmount(result._sum.amount ?? 0);
  }

  create(data: CreateData) {
    const amount = roundAmount(data.amount);

    return this.prisma.$transaction(async (tx) => {
      if (data.idempotencyKey) {
        const existing = await tx.payout.findUnique({
          where: { idempotencyKey: data.idempotencyKey },
        });
        if (existing) {
          return { payout: existing, created: false as const };
        }
      }

      const payout = await tx.payout.create({
        data: {
          payoutNumber: data.payoutNumber,
          recipientType: data.recipient.type,
          recipientId: data.recipient.id,
          bankAccountId: data.bankAccountId,
          accountHolderName: data.accountHolderName,
          iban: data.iban,
          bic: data.bic,
          bankName: data.bankName,
          amount,
          status: PayoutStatus.PENDING,
          idempotencyKey: data.idempotencyKey ?? null,
          notes: data.notes ?? null,
          createdBy: data.userId,
        },
      });

      await tx.payoutEvent.create({
        data: {
          payoutId: payout.id,
          event: PayoutLifecycleEvent.CREATED,
          newStatus: PayoutStatus.PENDING,
        },
      });

      await tx.payoutEvent.create({
        data: {
          payoutId: payout.id,
          event: PayoutLifecycleEvent.SUBMITTED,
          previousStatus: PayoutStatus.PENDING,
          newStatus: PayoutStatus.PENDING,
        },
      });

      return { payout, created: true as const };
    });
  }

  updateStatus(id: string, status: PayoutStatus, data: UpdateStatusData = {}) {
    const now = new Date();

    return this.prisma.$transaction(async (tx) => {
      const current = await tx.payout.findUniqueOrThrow({
        where: { id },
      });

      const payoutUpdate: StatusUpdate = {
        status,
      };

      if (status === PayoutStatus.APPROVED) {
        payoutUpdate.approvedAt = now;
      }
      if (status === PayoutStatus.PROCESSING) {
        payoutUpdate.processingAt = now;
      }
      if (status === PayoutStatus.PAID) {
        payoutUpdate.paidAt = now;
      }
      if (status === PayoutStatus.REJECTED) {
        payoutUpdate.rejectedAt = now;
        payoutUpdate.failureReason = data.failureReason ?? null;
      }
      if (status === PayoutStatus.CANCELLED) {
        payoutUpdate.cancelledAt = now;
      }
      if (data.notes !== undefined) {
        payoutUpdate.notes = data.notes;
      }

      const updateData: PayoutUpdate = {
        status: payoutUpdate.status,
        updatedAt: now,
      };

      if (payoutUpdate.approvedAt !== undefined) {
        updateData.approvedAt = payoutUpdate.approvedAt;
      }
      if (payoutUpdate.processingAt !== undefined) {
        updateData.processingAt = payoutUpdate.processingAt;
      }
      if (payoutUpdate.paidAt !== undefined) {
        updateData.paidAt = payoutUpdate.paidAt;
      }
      if (payoutUpdate.rejectedAt !== undefined) {
        updateData.rejectedAt = payoutUpdate.rejectedAt;
      }
      if (payoutUpdate.cancelledAt !== undefined) {
        updateData.cancelledAt = payoutUpdate.cancelledAt;
      }
      if (payoutUpdate.failureReason !== undefined) {
        updateData.failureReason = payoutUpdate.failureReason;
      }
      if (payoutUpdate.notes !== undefined) {
        updateData.notes = payoutUpdate.notes;
      }

      await tx.payout.update({
        where: { id },
        data: updateData,
      });

      let event: PayoutLifecycleEvent;
      if (status === PayoutStatus.APPROVED) {
        event = PayoutLifecycleEvent.APPROVED;
      } else if (status === PayoutStatus.PROCESSING) {
        event = PayoutLifecycleEvent.PROCESSING;
      } else if (status === PayoutStatus.REJECTED) {
        event = PayoutLifecycleEvent.REJECTED;
      } else if (status === PayoutStatus.CANCELLED) {
        event = PayoutLifecycleEvent.CANCELLED;
      } else {
        throw new Error(`No lifecycle event for payout status ${status}`);
      }

      const eventData: EventCreate = {
        payoutId: id,
        event,
        previousStatus: current.status,
        newStatus: status,
      };
      if (data.failureReason !== undefined) {
        eventData.metadata = { failureReason: data.failureReason } as Prisma.InputJsonValue;
      }

      await tx.payoutEvent.create({ data: eventData });

      return tx.payout.findUniqueOrThrow({
        where: { id },
      });
    });
  }

  settle(params: SettleData, description: string) {
    const now = new Date();

    return this.prisma.$transaction(async (tx) => {
      const payout = await tx.payout.findUnique({
        where: { id: params.payoutId },
      });
      if (!payout) {
        return null;
      }

      if (payout.status === PayoutStatus.PAID) {
        const existingDebit = await tx.walletTransaction.findUnique({
          where: { payoutId: params.payoutId },
        });
        if (existingDebit) {
          return tx.payout.findUniqueOrThrow({
            where: { id: params.payoutId },
          });
        }
      } else {
        const claimed = await tx.payout.updateMany({
          where: {
            id: params.payoutId,
            status: { in: [PayoutStatus.APPROVED, PayoutStatus.PROCESSING] },
          },
          data: {
            status: PayoutStatus.PAID,
            paidAt: now,
            updatedAt: now,
          },
        });

        if (claimed.count === 0) {
          return null;
        }
      }

      const existingDebit = await tx.walletTransaction.findUnique({
        where: { payoutId: params.payoutId },
      });
      let createdDebit = false;
      if (!existingDebit) {
        const wallet = await tx.wallet.findUniqueOrThrow({
          where: { id: params.walletId },
        });
        const debitAmount = toAmount(payout.amount);
        const currentBalance = toAmount(wallet.balance);
        if (currentBalance < debitAmount) {
          throw new Error("Insufficient wallet balance");
        }

        const balanceAfter = roundAmount(currentBalance - debitAmount);
        await tx.wallet.update({
          where: { id: wallet.id },
          data: { balance: balanceAfter },
        });

        await tx.walletTransaction.create({
          data: {
            walletId: wallet.id,
            type: WalletTransactionType.PAYOUT_DEBIT,
            amount: roundAmount(debitAmount),
            balanceAfter,
            payoutId: payout.id,
            description,
          },
        });
        createdDebit = true;
      }

      if (createdDebit || payout.status !== PayoutStatus.PAID) {
        await tx.payoutEvent.create({
          data: {
            payoutId: params.payoutId,
            event:
              payout.status === PayoutStatus.PAID
                ? PayoutLifecycleEvent.RECONCILED
                : PayoutLifecycleEvent.PAID,
            previousStatus:
              payout.status === PayoutStatus.PAID ? PayoutStatus.PAID : PayoutStatus.APPROVED,
            newStatus: PayoutStatus.PAID,
          },
        });
      }

      return tx.payout.findUniqueOrThrow({
        where: { id: params.payoutId },
      });
    });
  }

  countStale(olderThan: Date) {
    return this.prisma.payout.count({
      where: {
        status: { in: [PayoutStatus.APPROVED, PayoutStatus.PROCESSING] },
        updatedAt: { lte: olderThan },
      },
    });
  }

  countUnsettled() {
    return this.prisma.payout.count({
      where: {
        status: PayoutStatus.PAID,
        walletTransaction: null,
      },
    });
  }

  findUnsettled(take = 50) {
    return this.prisma.payout.findMany({
      where: {
        status: PayoutStatus.PAID,
        walletTransaction: null,
      },
      take,
      orderBy: { paidAt: "asc" },
    });
  }

  groupReservedByRecipient() {
    return this.prisma.payout.groupBy({
      by: ["recipientType", "recipientId"],
      where: {
        status: {
          in: [PayoutStatus.PENDING, PayoutStatus.APPROVED, PayoutStatus.PROCESSING],
        },
      },
      _sum: { amount: true },
    });
  }
}
