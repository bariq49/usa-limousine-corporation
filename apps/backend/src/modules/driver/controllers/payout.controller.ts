import { Body, Controller, Get, Inject, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { RoleKey } from "@prisma/client";
import type { Request } from "express";
import { Roles } from "../../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { QueryDto, RequestPayoutDto } from "../dto/payout.dto";
import { DriverPayoutService } from "../services/payout.service";

@Controller("drivers")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleKey.DRIVER)
export class DriverPayoutController {
  constructor(@Inject(DriverPayoutService) private readonly payoutService: DriverPayoutService) {}

  @Post("payouts")
  requestPayout(@Body() body: RequestPayoutDto, @Req() request: Request) {
    return this.payoutService.request(body, request);
  }

  @Get("payouts")
  listPayouts(@Query() query: QueryDto, @Req() request: Request) {
    return this.payoutService.list(query, request);
  }

  @Get("payouts/:id")
  getPayout(@Param("id") id: string, @Req() request: Request) {
    return this.payoutService.getOne(id, request);
  }

  @Post("payouts/:id/cancel")
  cancelPayout(@Param("id") id: string, @Req() request: Request) {
    return this.payoutService.cancel(id, request);
  }
}
