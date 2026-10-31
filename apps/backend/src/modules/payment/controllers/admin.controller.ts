import { Body, Controller, Get, Inject, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { RoleKey } from "@prisma/client";
import type { Request } from "express";
import { Roles } from "../../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { QueryDto, RefundDto } from "../dto/payment.dto";
import { PaymentService } from "../services/payment.service";

@Controller("admin/payments")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleKey.SUPER_ADMIN)
export class AdminPaymentController {
  constructor(@Inject(PaymentService) private readonly paymentService: PaymentService) {}

  @Get()
  list(@Query() query: QueryDto) {
    return this.paymentService.list(query);
  }

  @Get(":id")
  getOne(@Param("id") id: string) {
    return this.paymentService.getOne(id);
  }

  @Post(":id/refund")
  refund(@Param("id") id: string, @Body() body: RefundDto, @Req() request: Request) {
    return this.paymentService.refund(id, body, request);
  }
}
