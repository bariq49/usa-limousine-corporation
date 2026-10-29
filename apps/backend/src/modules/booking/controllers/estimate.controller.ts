import { Body, Controller, HttpCode, Inject, Post, UseGuards } from "@nestjs/common";
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";
import { TripPriceDto } from "../dto/booking.dto";
import { EstimateService } from "../services/estimate.service";

@Controller("public/estimates")
@UseGuards(ThrottlerGuard)
export class EstimateController {
  constructor(@Inject(EstimateService) private readonly estimateService: EstimateService) {}

  @Post()
  @HttpCode(200)
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  estimate(@Body() body: TripPriceDto) {
    return this.estimateService.estimate(body);
  }
}
