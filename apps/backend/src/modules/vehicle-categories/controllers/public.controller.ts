import { Controller, Get, Inject, Query } from "@nestjs/common";
import { DistanceQueryDto } from "../dto/distance-query.dto";
import { LuggageQueryDto } from "../dto/luggage-query.dto";
import { VehicleCategoryQueryDto } from "../dto/query.dto";
import { PublicService } from "../services/public.service";

@Controller("public")
export class PublicController {
  constructor(
    @Inject(PublicService)
    private readonly publicService: PublicService,
  ) {}

  @Get("vehicle-categories")
  findCategories(@Query() query: VehicleCategoryQueryDto) {
    return this.publicService.findCategories(query);
  }

  @Get("vehicle-categories/pricing")
  findCategoriesForDistance(@Query() query: DistanceQueryDto) {
    return this.publicService.findCategoriesForDistance(query);
  }

  @Get("luggage")
  findLuggage(@Query() query: LuggageQueryDto) {
    return this.publicService.findLuggage(query);
  }
}
