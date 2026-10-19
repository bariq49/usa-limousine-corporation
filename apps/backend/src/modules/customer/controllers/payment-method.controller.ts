import { Body, Controller, Delete, Get, Inject, Param, Post, Req, UseGuards } from "@nestjs/common";
import { RoleKey } from "@prisma/client";
import type { Request } from "express";
import { Roles } from "../../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { AddPaymentMethodDto, ConfirmPaymentMethodDto } from "../dto/payment-method.dto";
import { CustomerPaymentMethodService } from "../services/payment-method.service";

@Controller("customers/payment-methods")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleKey.CUSTOMER)
export class CustomerPaymentMethodController {
  constructor(
    @Inject(CustomerPaymentMethodService)
    private readonly paymentMethods: CustomerPaymentMethodService,
  ) {}

  @Get()
  list(@Req() request: Request) {
    return this.paymentMethods.list(request);
  }

  @Post()
  add(@Body() body: AddPaymentMethodDto, @Req() request: Request) {
    return this.paymentMethods.add(body, request);
  }

  @Post("setup-intent")
  createSetupIntent(@Req() request: Request) {
    return this.paymentMethods.createSetupIntent(request);
  }

  @Post("confirm")
  confirm(@Body() body: ConfirmPaymentMethodDto, @Req() request: Request) {
    return this.paymentMethods.confirm(body, request);
  }

  @Post(":id/default")
  setDefault(@Param("id") id: string, @Req() request: Request) {
    return this.paymentMethods.setDefault(id, request);
  }

  @Delete(":id")
  remove(@Param("id") id: string, @Req() request: Request) {
    return this.paymentMethods.remove(id, request);
  }
}
