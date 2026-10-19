import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { Request } from "express";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { auditLog } from "../../../common/utils/audit-log";
import { toRequestContext } from "../../../common/utils/to-request-context";
import type { AddDto, UpdateDto } from "../dto/bank-account.dto";
import { DriverBankAccountRepository } from "../repositories/bank-account.repository";
import { DriverRepository } from "../repositories/driver.repository";
import { requireDriver } from "../utils/require-driver";

@Injectable()
export class DriverBankAccountService {
  constructor(
    @Inject(DriverRepository) private readonly driverRepository: DriverRepository,
    @Inject(DriverBankAccountRepository)
    private readonly bankAccountRepository: DriverBankAccountRepository,
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  async listBankAccounts(request: Request) {
    const driver = await requireDriver(this.driverRepository, request);
    return this.bankAccountRepository.list(driver.id);
  }

  async addBankAccount(body: AddDto, request: Request) {
    const context = toRequestContext(request);
    const driver = await requireDriver(this.driverRepository, request);

    const bankAccount = await this.bankAccountRepository.add(driver.id, body);

    await auditLog({
      prisma: this.prisma,
      event: "driver.bank_account_added",
      result: "success",
      context,
      userId: context.userId,
      metadata: {
        driverId: driver.id,
        applicationNumber: driver.applicationNumber,
        accountId: bankAccount.id,
        ibanLast4: bankAccount.iban.slice(-4),
        isDefault: bankAccount.isDefault,
      },
    });

    return bankAccount;
  }

  async updateBankAccount(id: string, body: UpdateDto, request: Request) {
    const context = toRequestContext(request);
    const driver = await requireDriver(this.driverRepository, request);

    const existing = await this.bankAccountRepository.findById(driver.id, id);
    if (!existing) {
      throw new NotFoundException("Bank account not found");
    }
    if (body.isDefault === false && existing.isDefault) {
      throw new BadRequestException(
        "Cannot unset the default bank account. Make another account default instead.",
      );
    }

    const bankAccount = await this.bankAccountRepository.update(driver.id, id, body);

    await auditLog({
      prisma: this.prisma,
      event: "driver.bank_account_updated",
      result: "success",
      context,
      userId: context.userId,
      metadata: {
        driverId: driver.id,
        applicationNumber: driver.applicationNumber,
        accountId: bankAccount.id,
        ibanLast4: bankAccount.iban.slice(-4),
        isDefault: bankAccount.isDefault,
      },
    });

    return bankAccount;
  }

  async setDefaultBankAccount(id: string, request: Request) {
    const context = toRequestContext(request);
    const driver = await requireDriver(this.driverRepository, request);

    const existing = await this.bankAccountRepository.findById(driver.id, id);
    if (!existing) {
      throw new NotFoundException("Bank account not found");
    }

    const bankAccount = await this.bankAccountRepository.setDefault(driver.id, id);

    await auditLog({
      prisma: this.prisma,
      event: "driver.bank_account_default_set",
      result: "success",
      context,
      userId: context.userId,
      metadata: {
        driverId: driver.id,
        applicationNumber: driver.applicationNumber,
        accountId: bankAccount.id,
        ibanLast4: bankAccount.iban.slice(-4),
      },
    });

    return bankAccount;
  }

  async deleteBankAccount(id: string, request: Request) {
    const context = toRequestContext(request);
    const driver = await requireDriver(this.driverRepository, request);

    const bankAccount = await this.bankAccountRepository.delete(driver.id, id);
    if (!bankAccount) {
      throw new NotFoundException("Bank account not found");
    }

    await auditLog({
      prisma: this.prisma,
      event: "driver.bank_account_deleted",
      result: "success",
      context,
      userId: context.userId,
      metadata: {
        driverId: driver.id,
        applicationNumber: driver.applicationNumber,
        accountId: bankAccount.id,
        ibanLast4: bankAccount.iban.slice(-4),
      },
    });

    return { message: "Bank account deleted" };
  }
}
