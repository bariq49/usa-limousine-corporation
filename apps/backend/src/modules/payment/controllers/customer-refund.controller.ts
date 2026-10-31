import { Controller, Get, Inject, Param, Query, Req, UseGuards } from "@nestjs/common";
import { RoleKey } from "@prisma/client";
import type { Request } from "express";
import { Roles } from "../../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { RefundQueryDto } from "../dto/payment.dto";
import { PaymentService } from "../services/payment.service";

@Controller("customers/refunds")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleKey.CUSTOMER)
export class CustomerRefundController {
  constructor(@Inject(PaymentService) private readonly paymentService: PaymentService) {}

  @Get()
  list(@Query() query: RefundQueryDto, @Req() request: Request) {
    return this.paymentService.listRefundsByCustomer(query, request);
  }

  @Get(":id")
  getOne(@Param("id") id: string, @Req() request: Request) {
    return this.paymentService.getRefundForCustomer(id, request);
  }
}
