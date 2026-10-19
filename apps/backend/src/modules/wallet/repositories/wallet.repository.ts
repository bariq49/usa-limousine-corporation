import { Inject, Injectable } from "@nestjs/common";
import { WalletTransactionType, type Prisma } from "@prisma/client";
import { APIFeature } from "../../../common/api-feature";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import type { Credit, Debit, List, Owner } from "../types/wallet";
import { roundAmount, toAmount } from "../../../common/utils/money";

@Injectable()
export class WalletRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  findById(walletId: string) {
    return this.prisma.wallet.findUnique({
      where: { id: walletId },
    });
  }

  findByOwner(owner: Owner) {
    return this.prisma.wallet.findUnique({
      where: {
        ownerType_ownerId: {
          ownerType: owner.ownerType,
          ownerId: owner.ownerId,
        },
      },
    });
  }

  create(owner: Owner) {
    return this.prisma.wallet.create({
      data: {
        ownerType: owner.ownerType,
        ownerId: owner.ownerId,
        balance: 0,
      },
    });
  }

  async ensure(owner: Owner) {
    const existing = await this.findByOwner(owner);
    if (existing) {
      return existing;
    }
    return this.create(owner);
  }

  async credit(params: Credit) {
    const { walletId, tripId, bookingId, amount, description } = params;
    const creditAmount = roundAmount(amount);

    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.walletTransaction.findUnique({
        where: { tripId },
      });
      if (existing) {
        const wallet = await tx.wallet.findUniqueOrThrow({
          where: { id: existing.walletId },
        });
        return {
          credited: false as const,
          wallet,
          transaction: existing,
        };
      }

      const wallet = await tx.wallet.findUniqueOrThrow({
        where: { id: walletId },
      });

      const balanceAfter = roundAmount(toAmount(wallet.balance) + creditAmount);
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: balanceAfter },
      });

      const transactionData: Prisma.WalletTransactionCreateInput = {
        wallet: { connect: { id: wallet.id } },
        type: WalletTransactionType.TRIP_CREDIT,
        amount: creditAmount,
        balanceAfter,
        bookingId,
        tripId,
      };
      if (description !== undefined) {
        transactionData.description = description;
      }

      const transaction = await tx.walletTransaction.create({
        data: transactionData,
      });

      return {
        credited: true as const,
        wallet: updatedWallet,
        transaction,
      };
    });
  }

  async debit(params: Debit) {
    const { walletId, payoutId, amount, description } = params;
    const debitAmount = roundAmount(amount);

    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.walletTransaction.findUnique({
        where: { payoutId },
      });
      if (existing) {
        const wallet = await tx.wallet.findUniqueOrThrow({
          where: { id: existing.walletId },
        });
        return {
          debited: false as const,
          wallet,
          transaction: existing,
        };
      }

      const wallet = await tx.wallet.findUniqueOrThrow({
        where: { id: walletId },
      });

      const currentBalance = toAmount(wallet.balance);
      if (currentBalance < debitAmount) {
        throw new Error("Insufficient wallet balance");
      }

      const balanceAfter = roundAmount(currentBalance - debitAmount);
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: balanceAfter },
      });

      const transactionData: Prisma.WalletTransactionCreateInput = {
        wallet: { connect: { id: wallet.id } },
        type: WalletTransactionType.PAYOUT_DEBIT,
        amount: debitAmount,
        balanceAfter,
        payout: { connect: { id: payoutId } },
      };
      if (description !== undefined) {
        transactionData.description = description;
      }

      const transaction = await tx.walletTransaction.create({
        data: transactionData,
      });

      return {
        debited: true as const,
        wallet: updatedWallet,
        transaction,
      };
    });
  }

  async sumByType(walletId: string, type: WalletTransactionType) {
    const result = await this.prisma.walletTransaction.aggregate({
      where: { walletId, type },
      _sum: { amount: true },
    });

    return toAmount(result._sum.amount ?? 0);
  }

  list(params: List) {
    const { walletId, ...query } = params;

    const feature = new APIFeature(query, {
      initialFilter: {
        walletId,
      },
      filterFields: ["type"],
      search: {
        searchFields: ["description", "bookingId", "tripId"],
      },
      sort: {
        allowedFields: ["createdAt", "amount", "balanceAfter"],
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

    return feature
      .execute({
        findMany: (args) =>
          this.prisma.walletTransaction.findMany({
            where: args.where as never,
            orderBy: args.orderBy as never,
            skip: args.skip,
            take: args.take,
          }),
        count: ({ where }) => this.prisma.walletTransaction.count({ where: where as never }),
      })
      .then((result) => ({
        items: result.data.map((row) => ({
          id: row.id,
          type: row.type,
          amount: toAmount(row.amount),
          balanceAfter: toAmount(row.balanceAfter),
          bookingId: row.bookingId,
          tripId: row.tripId,
          description: row.description,
          createdAt: row.createdAt,
        })),
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.pages,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
      }));
  }
}
