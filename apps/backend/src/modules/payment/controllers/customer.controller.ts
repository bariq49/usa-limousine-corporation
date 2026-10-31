import { Controller, Get, Inject, Param, Query, Req, UseGuards } from "@nestjs/common";
import { RoleKey } from "@prisma/client";
import type { Request } from "express";
import { Roles } from "../../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { QueryDto } from "../dto/payment.dto";
import { PaymentService } from "../services/payment.service";

@Controller("customers/payments")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleKey.CUSTOMER)
export class CustomerPaymentController {
  constructor(@Inject(PaymentService) private readonly paymentService: PaymentService) {}

  @Get()
  list(@Query() query: QueryDto, @Req() request: Request) {
    return this.paymentService.listByCustomer(query, request);
  }

  @Get(":id")
  getOne(@Param("id") id: string, @Req() request: Request) {
    return this.paymentService.getOneForCustomer(id, request);
  }
}
