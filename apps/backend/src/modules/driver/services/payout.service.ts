import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { WalletOwnerType } from "@prisma/client";
import type { Request } from "express";
import { PayoutService } from "../../payout/services/payout.service";
import type { QueryDto, RequestPayoutDto } from "../dto/payout.dto";
import { DriverRepository } from "../repositories/driver.repository";
import { requireDriver } from "../utils/require-driver";

@Injectable()
export class DriverPayoutService {
  constructor(
    @Inject(DriverRepository) private readonly driverRepository: DriverRepository,
    @Inject(PayoutService) private readonly payoutService: PayoutService,
  ) {}

  async request(body: RequestPayoutDto, request: Request) {
    const driver = await requireDriver(this.driverRepository, request);

    const params = {
      recipient: { type: WalletOwnerType.DRIVER, id: driver.id },
      amount: body.amount,
    } as Parameters<PayoutService["request"]>[0];

    if (body.bankAccountId !== undefined) {
      params.bankAccountId = body.bankAccountId;
    }
    if (body.idempotencyKey !== undefined) {
      params.idempotencyKey = body.idempotencyKey;
    }
    if (body.notes !== undefined) {
      params.notes = body.notes;
    }

    return this.payoutService.request(params, request);
  }

  async list(query: QueryDto, request: Request) {
    const driver = await requireDriver(this.driverRepository, request);
    query.recipientType = WalletOwnerType.DRIVER;
    query.recipientId = driver.id;
    return this.payoutService.list(query);
  }

  async getOne(id: string, request: Request) {
    const driver = await requireDriver(this.driverRepository, request);
    const payout = await this.payoutService.getOne(id);
    if (payout.recipientType !== WalletOwnerType.DRIVER || payout.recipientId !== driver.id) {
      throw new NotFoundException("Payout not found");
    }
    return payout;
  }

  async cancel(id: string, request: Request) {
    const driver = await requireDriver(this.driverRepository, request);
    return this.payoutService.cancel(id, { type: WalletOwnerType.DRIVER, id: driver.id }, request);
  }
}
