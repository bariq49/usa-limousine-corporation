import { Module } from "@nestjs/common";
import { AdminController } from "./controllers/admin.controller";
import { PublicController } from "./controllers/public.controller";
import { ExtraServiceRepository } from "./repositories/extra-service.repository";
import { ExtraServiceService } from "./services/extra-service.service";

import { DatabaseModule } from "../../infrastructure/database/database.module";

@Module({
  imports: [DatabaseModule],
  controllers: [AdminController, PublicController],
  providers: [ExtraServiceService, ExtraServiceRepository],
  exports: [ExtraServiceService, ExtraServiceRepository],
})
export class ExtraServiceModule {}
