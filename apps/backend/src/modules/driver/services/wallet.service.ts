import { Inject, Injectable } from "@nestjs/common";
import { WalletOwnerType } from "@prisma/client";
import type { Request } from "express";
import { WalletService } from "../../wallet/services/wallet.service";
import type { List } from "../../wallet/types/wallet";
import type { QueryDto } from "../dto/wallet.dto";
import { DriverRepository } from "../repositories/driver.repository";
import { requireDriver } from "../utils/require-driver";

@Injectable()
export class DriverWalletService {
  constructor(
    @Inject(DriverRepository) private readonly driverRepository: DriverRepository,
    @Inject(WalletService) private readonly walletService: WalletService,
  ) {}

  async getWallet(request: Request) {
    const driver = await requireDriver(this.driverRepository, request);
    const wallet = await this.walletService.findByOwner({
      ownerType: WalletOwnerType.DRIVER,
      ownerId: driver.id,
    });
    if (!wallet) {
      return {
        id: "",
        balance: 0,
        updatedAt: new Date(0),
      };
    }

    return this.walletService.get(wallet.id);
  }

  async listWalletTransactions(query: QueryDto, request: Request) {
    const driver = await requireDriver(this.driverRepository, request);
    const wallet = await this.walletService.findByOwner({
      ownerType: WalletOwnerType.DRIVER,
      ownerId: driver.id,
    });
    if (!wallet) {
      return {
        items: [],
        total: 0,
        page: query.page ?? 1,
        limit: query.limit ?? 20,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      };
    }

    const params: List = {
      walletId: wallet.id,
    };
    if (query.page !== undefined) {
      params.page = query.page;
    }
    if (query.limit !== undefined) {
      params.limit = query.limit;
    }
    if (query.sortBy !== undefined) {
      params.sortBy = query.sortBy;
    }
    if (query.sortOrder !== undefined) {
      params.sortOrder = query.sortOrder;
    }
    if (query.sort !== undefined) {
      params.sort = query.sort;
    }
    if (query.q !== undefined) {
      params.q = query.q;
    }
    if (query.search !== undefined) {
      params.search = query.search;
    }
    if (query.startDate !== undefined) {
      params.startDate = query.startDate;
    }
    if (query.endDate !== undefined) {
      params.endDate = query.endDate;
    }
    if (query.type !== undefined) {
      params.type = query.type;
    }

    return this.walletService.list(params);
  }

  async ensureWalletId(driverId: string): Promise<string> {
    const wallet = await this.walletService.ensure({
      ownerType: WalletOwnerType.DRIVER,
      ownerId: driverId,
    });
    return wallet.id;
  }
}
