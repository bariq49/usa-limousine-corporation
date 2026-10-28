import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Inject,
  Param,
  Post,
  Req,
  type RawBodyRequest,
  UseGuards,
} from "@nestjs/common";
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";
import type { Request } from "express";
import { CheckoutDto } from "../../booking/dto/booking.dto";
import { CheckoutOrderParamDto } from "../dto/checkout.dto";
import { PaymentService } from "../services/payment.service";

@Controller()
export class CheckoutController {
  constructor(@Inject(PaymentService) private readonly paymentService: PaymentService) {}

  @Post("public/bookings/checkout")
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  start(@Body() body: CheckoutDto, @Req() request: Request) {
    return this.paymentService.startCheckout(body, request);
  }

  @Get("public/bookings/checkout/:orderId")
  @UseGuards(ThrottlerGuard)
  checkoutBooking(@Param() params: CheckoutOrderParamDto) {
    return this.paymentService.checkoutBooking(params.orderId);
  }

  @Post("payments/square/webhook")
  @HttpCode(200)
  webhook(
    @Req() request: RawBodyRequest<Request>,
    @Headers("x-square-hmacsha256-signature") signature: string | undefined,
  ) {
    return this.paymentService.handleWebhook(request.rawBody, signature);
  }
}
