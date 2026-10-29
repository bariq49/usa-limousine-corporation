import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../infrastructure/database/database.module";
import { AuthModule } from "../auth/auth.module";
import { CategoriesController } from "./controllers/categories.controller";
import { HourlyPricingController } from "./controllers/hourly-pricing.controller";
import { LuggageController } from "./controllers/luggage.controller";
import { PricingController } from "./controllers/pricing.controller";
import { PublicController } from "./controllers/public.controller";
import { CategoriesRepository } from "./repositories/categories.repository";
import { HourlyPricingRepository } from "./repositories/hourly-pricing.repository";
import { LuggageRepository } from "./repositories/luggage.repository";
import { PricingRepository } from "./repositories/pricing.repository";
import { CategoriesService } from "./services/categories.service";
import { HourlyPricingService } from "./services/hourly-pricing.service";
import { LuggageService } from "./services/luggage.service";
import { PricingService } from "./services/pricing.service";
import { PublicService } from "./services/public.service";

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [
    PublicController,
    CategoriesController,
    LuggageController,
    PricingController,
    HourlyPricingController,
  ],
  providers: [
    CategoriesRepository,
    LuggageRepository,
    PricingRepository,
    HourlyPricingRepository,
    PublicService,
    CategoriesService,
    LuggageService,
    PricingService,
    HourlyPricingService,
  ],
  exports: [PublicService, CategoriesService, LuggageService, PricingService, HourlyPricingService],
})
export class VehicleCategoryModule {}
