import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../infrastructure/database/database.module";
import { AuthModule } from "../auth/auth.module";
import { CategoriesController } from "./controllers/categories.controller";
import { LuggageController } from "./controllers/luggage.controller";
import { PricingController } from "./controllers/pricing.controller";
import { PublicController } from "./controllers/public.controller";
import { CategoriesRepository } from "./repositories/categories.repository";
import { LuggageRepository } from "./repositories/luggage.repository";
import { PricingRepository } from "./repositories/pricing.repository";
import { CategoriesService } from "./services/categories.service";
import { LuggageService } from "./services/luggage.service";
import { PricingService } from "./services/pricing.service";
import { PublicService } from "./services/public.service";

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [PublicController, CategoriesController, LuggageController, PricingController],
  providers: [
    CategoriesRepository,
    LuggageRepository,
    PricingRepository,
    PublicService,
    CategoriesService,
    LuggageService,
    PricingService,
  ],
  exports: [PublicService, CategoriesService, LuggageService, PricingService],
})
export class VehicleCategoryModule {}
