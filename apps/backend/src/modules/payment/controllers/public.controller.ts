import { Body, Controller, Get, Inject, Param, Post, Req, UseGuards } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";
import type { Request } from "express";
import { CheckoutDto } from "../dto/checkout.dto";
import { CheckoutService } from "../services/checkout.service";
import { PaymentService } from "../services/payment.service";

@Controller("payments")
@UseGuards(ThrottlerGuard)
export class PublicController {
  constructor(
    @Inject(CheckoutService) private readonly checkoutService: CheckoutService,
    @Inject(PaymentService) private readonly paymentService: PaymentService,
  ) {}

  @Post("checkout")
  checkout(@Body() body: CheckoutDto, @Req() request: Request) {
    return this.checkoutService.createSession(body, request);
  }

  @Get(":id/status")
  status(@Param("id") id: string) {
    return this.paymentService.getStatus(id);
  }
}
