import { Body, Controller, Get, Inject, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { RoleKey } from "@prisma/client";
import type { Request } from "express";
import { Roles } from "../../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import {
  CompleteRefundDto,
  CreateRefundDto,
  RefundQueryDto,
  RejectRefundDto,
} from "../dto/payment.dto";
import { PaymentService } from "../services/payment.service";

@Controller("admin/refunds")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleKey.SUPER_ADMIN)
export class AdminRefundController {
  constructor(@Inject(PaymentService) private readonly paymentService: PaymentService) {}

  @Get()
  list(@Query() query: RefundQueryDto) {
    return this.paymentService.listRefunds(query);
  }

  @Get(":id")
  getOne(@Param("id") id: string) {
    return this.paymentService.getRefund(id);
  }

  @Post()
  create(@Body() body: CreateRefundDto, @Req() request: Request) {
    return this.paymentService.createRefund(body, request);
  }

  @Post(":id/complete")
  complete(@Param("id") id: string, @Body() body: CompleteRefundDto, @Req() request: Request) {
    return this.paymentService.completeRefund(id, body, request);
  }

  @Post(":id/reject")
  reject(@Param("id") id: string, @Body() body: RejectRefundDto, @Req() request: Request) {
    return this.paymentService.rejectRefund(id, body, request);
  }
}
