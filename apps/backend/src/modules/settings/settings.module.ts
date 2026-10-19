import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../infrastructure/database/database.module";
import { RedisModule } from "../../infrastructure/redis/redis.module";
import { AuthModule } from "../auth/auth.module";
import { SettingsController } from "./controllers/settings.controller";
import { SettingsRepository } from "./repositories/settings.repository";
import { SettingsService } from "./services/settings.service";

@Module({
  imports: [DatabaseModule, AuthModule, RedisModule],
  controllers: [SettingsController],
  providers: [SettingsRepository, SettingsService],
  exports: [SettingsService, SettingsRepository],
})
export class SettingsModule {}
