import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { WalletRepository } from "../repositories/wallet.repository";
import { WalletTransactionType } from "@prisma/client";
import type {
  Credit,
  CreditResult,
  Debit,
  DebitResult,
  List,
  Owner,
  Summary,
} from "../types/wallet";
import { toAmount } from "../../../common/utils/money";

@Injectable()
export class WalletService {
  constructor(@Inject(WalletRepository) private readonly repository: WalletRepository) {}

  findByOwner(owner: Owner) {
    return this.repository.findByOwner(owner);
  }

  ensure(owner: Owner) {
    return this.repository.ensure(owner);
  }

  async get(walletId: string): Promise<Summary> {
    const wallet = await this.repository.findById(walletId);
    if (!wallet) {
      throw new NotFoundException("Wallet not found");
    }

    return {
      id: wallet.id,
      balance: toAmount(wallet.balance),
      updatedAt: wallet.updatedAt,
    };
  }

  list(params: List) {
    return this.repository.list(params);
  }

  sumCredits(walletId: string) {
    return this.repository.sumByType(walletId, WalletTransactionType.TRIP_CREDIT);
  }

  sumDebits(walletId: string) {
    return this.repository.sumByType(walletId, WalletTransactionType.PAYOUT_DEBIT);
  }

  async credit(params: Credit): Promise<CreditResult> {
    const result = await this.repository.credit(params);
    const amount = toAmount(result.transaction.amount);
    const balance = toAmount(result.wallet.balance);

    return {
      credited: result.credited,
      walletId: result.wallet.id,
      transactionId: result.transaction.id,
      balance,
      amount,
      tripId: params.tripId,
      bookingId: params.bookingId,
    };
  }

  async debit(params: Debit): Promise<DebitResult> {
    const result = await this.repository.debit(params);
    const amount = toAmount(result.transaction.amount);
    const balance = toAmount(result.wallet.balance);

    return {
      debited: result.debited,
      walletId: result.wallet.id,
      transactionId: result.transaction.id,
      balance,
      amount,
      payoutId: params.payoutId,
    };
  }
}
