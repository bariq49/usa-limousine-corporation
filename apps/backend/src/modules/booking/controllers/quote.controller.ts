import { Body, Controller, HttpCode, Inject, Post, UseGuards } from "@nestjs/common";
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";
import { QuoteDto, TripPriceDto } from "../dto/booking.dto";
import { QuoteService } from "../services/quote.service";

@Controller("public/quotes")
@UseGuards(ThrottlerGuard)
export class QuoteController {
  constructor(@Inject(QuoteService) private readonly quoteService: QuoteService) {}

  @Post("estimates")
  @HttpCode(200)
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  estimate(@Body() body: TripPriceDto) {
    return this.quoteService.estimate(body);
  }

  @Post()
  @HttpCode(200)
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  create(@Body() body: QuoteDto) {
    return this.quoteService.create(body);
  }
}
