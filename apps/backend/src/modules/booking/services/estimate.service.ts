import { Inject, Injectable } from "@nestjs/common";
import type { TripPriceDto } from "../dto/booking.dto";
import type { VehicleEstimate } from "../types/booking";
import { BookingPricingService } from "./pricing.service";

@Injectable()
export class EstimateService {
  constructor(
    @Inject(BookingPricingService) private readonly pricingService: BookingPricingService,
  ) {}

  estimate(body: TripPriceDto, checkNotice = false): Promise<VehicleEstimate[]> {
    return this.pricingService.estimate(body, checkNotice);
  }
}
