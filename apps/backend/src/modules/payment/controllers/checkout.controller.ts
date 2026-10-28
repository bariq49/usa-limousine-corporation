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
  Res,
  type RawBodyRequest,
  StreamableFile,
  UseGuards,
} from "@nestjs/common";
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";
import type { Request, Response } from "express";
import { CheckoutDto } from "../../booking/dto/booking.dto";
import { CheckoutOrderParamDto } from "../dto/checkout.dto";
import { PaymentService } from "../services/payment.service";
import { ReceiptService } from "../../booking/services/receipt.service";

@Controller()
export class CheckoutController {
  constructor(
    @Inject(PaymentService) private readonly paymentService: PaymentService,
    @Inject(ReceiptService) private readonly receiptService: ReceiptService,
  ) {}

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

  @Get("public/bookings/checkout/:orderId/receipt")
  @UseGuards(ThrottlerGuard)
  async receipt(
    @Param() params: CheckoutOrderParamDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { fileName, pdf } = await this.receiptService.forOrder(params.orderId);
    response.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "private, no-store",
    });
    return new StreamableFile(pdf);
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
