import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { WalletOwnerType } from "@prisma/client";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import type { ResolveBank } from "../types/payout";

@Injectable()
export class PayoutBankResolver {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async resolve(params: ResolveBank) {
    const { recipient, bankAccountId } = params;

    if (recipient.type !== WalletOwnerType.DRIVER) {
      throw new BadRequestException(`Payout recipient type ${recipient.type} is not supported yet`);
    }

    const account = bankAccountId
      ? await this.prisma.driverBankAccount.findFirst({
          where: { id: bankAccountId, driverId: recipient.id },
        })
      : await this.prisma.driverBankAccount.findFirst({
          where: { driverId: recipient.id },
          orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
        });

    if (!account) {
      throw new BadRequestException("Bank account is required for payout");
    }

    return {
      bankAccountId: account.id,
      accountHolderName: account.accountHolderName,
      iban: account.iban,
      bic: account.bic,
      bankName: account.bankName,
    };
  }
}
