import { Controller, Get, Inject, Query, Req, UseGuards } from "@nestjs/common";
import { RoleKey } from "@prisma/client";
import type { Request } from "express";
import { Roles } from "../../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { QueryDto } from "../dto/wallet.dto";
import { DriverWalletService } from "../services/wallet.service";
import { DriverWalletSummaryService } from "../services/wallet-summary.service";

@Controller("drivers")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleKey.DRIVER)
export class DriverWalletController {
  constructor(
    @Inject(DriverWalletService) private readonly walletService: DriverWalletService,
    @Inject(DriverWalletSummaryService)
    private readonly walletSummaryService: DriverWalletSummaryService,
  ) {}

  @Get("wallet")
  getWallet(@Req() request: Request) {
    return this.walletService.getWallet(request);
  }

  @Get("wallet/summary")
  getWalletSummary(@Req() request: Request) {
    return this.walletSummaryService.getSummary(request);
  }

  @Get("wallet/transactions")
  listWalletTransactions(@Query() query: QueryDto, @Req() request: Request) {
    return this.walletService.listWalletTransactions(query, request);
  }
}
