import { Body, Controller, Get, Inject, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { RoleKey } from "@prisma/client";
import type { Request } from "express";
import { Roles } from "../../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { QueryDto, RejectDto } from "../dto/payout.dto";
import { PayoutService } from "../services/payout.service";

@Controller("admin/payouts")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleKey.SUPER_ADMIN)
export class PayoutController {
  constructor(@Inject(PayoutService) private readonly payoutService: PayoutService) {}

  @Get()
  list(@Query() query: QueryDto) {
    return this.payoutService.list(query);
  }

  @Get(":id")
  getOne(@Param("id") id: string) {
    return this.payoutService.getOne(id);
  }

  @Post(":id/approve")
  approve(@Param("id") id: string, @Req() request: Request) {
    return this.payoutService.approve(id, request);
  }

  @Post(":id/processing")
  markProcessing(@Param("id") id: string, @Req() request: Request) {
    return this.payoutService.markProcessing(id, request);
  }

  @Post(":id/mark-paid")
  markPaid(@Param("id") id: string, @Req() request: Request) {
    return this.payoutService.markPaid(id, request);
  }

  @Post(":id/reject")
  reject(@Param("id") id: string, @Body() body: RejectDto, @Req() request: Request) {
    return this.payoutService.reject(id, body, request);
  }
}
