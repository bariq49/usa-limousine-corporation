import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import type { AddDto, UpdateDto } from "../dto/bank-account.dto";

@Injectable()
export class DriverBankAccountRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  list(driverId: string) {
    return this.prisma.driverBankAccount.findMany({
      where: { driverId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    });
  }

  findById(driverId: string, id: string) {
    return this.prisma.driverBankAccount.findFirst({
      where: { id, driverId },
    });
  }

  async add(driverId: string, data: AddDto) {
    return this.prisma.$transaction(async (tx) => {
      const existingCount = await tx.driverBankAccount.count({ where: { driverId } });
      const isDefault = existingCount === 0 ? true : Boolean(data.isDefault);

      if (isDefault) {
        await tx.driverBankAccount.updateMany({
          where: { driverId, isDefault: true },
          data: { isDefault: false },
        });
      }

      return tx.driverBankAccount.create({
        data: {
          driverId,
          accountHolderName: data.accountHolderName,
          iban: data.iban,
          bic: data.bic ?? null,
          bankName: data.bankName ?? null,
          isDefault,
        },
      });
    });
  }

  async update(driverId: string, id: string, data: UpdateDto) {
    return this.prisma.$transaction(async (tx) => {
      if (data.isDefault === true) {
        await tx.driverBankAccount.updateMany({
          where: { driverId, isDefault: true, id: { not: id } },
          data: { isDefault: false },
        });
      }

      return tx.driverBankAccount.update({
        where: { id },
        data,
      });
    });
  }

  async setDefault(driverId: string, id: string) {
    return this.prisma.$transaction(async (tx) => {
      await tx.driverBankAccount.updateMany({
        where: { driverId, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });

      return tx.driverBankAccount.update({
        where: { id },
        data: { isDefault: true },
      });
    });
  }

  async delete(driverId: string, id: string) {
    return this.prisma.$transaction(async (tx) => {
      const account = await tx.driverBankAccount.findFirst({
        where: { id, driverId },
      });
      if (!account) {
        return null;
      }

      await tx.driverBankAccount.delete({ where: { id } });

      if (account.isDefault) {
        const next = await tx.driverBankAccount.findFirst({
          where: { driverId },
          orderBy: { createdAt: "asc" },
        });
        if (next) {
          await tx.driverBankAccount.update({
            where: { id: next.id },
            data: { isDefault: true },
          });
        }
      }

      return account;
    });
  }
}
