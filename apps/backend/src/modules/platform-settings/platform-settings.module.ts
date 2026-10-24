import { Module } from "@nestjs/common";
import { AdminController } from "./controllers/admin.controller";
import { PublicController } from "./controllers/public.controller";
import { PlatformSettingsRepository } from "./repositories/platform-settings.repository";
import { PlatformSettingsService } from "./services/platform-settings.service";

import { DatabaseModule } from "../../infrastructure/database/database.module";

@Module({
  imports: [DatabaseModule],
  controllers: [AdminController, PublicController],
  providers: [PlatformSettingsService, PlatformSettingsRepository],
  exports: [PlatformSettingsService],
})
export class PlatformSettingsModule {}
