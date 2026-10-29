import { Controller, Get, Inject, Param, Query } from "@nestjs/common";
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

  @Get("vehicle-categories/hourly-durations")
  findHourlyDurations() {
    return this.publicService.findHourlyDurations();
  }

  @Get("vehicle-categories/:id/luggage")
  findCategoryLuggage(@Param("id") id: string) {
    return this.publicService.findCategoryLuggage(id);
  }
}
