import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../infrastructure/database/database.module";
import { EmailModule } from "../../infrastructure/email/email.module";
import { RedisModule } from "../../infrastructure/redis/redis.module";
import { StorageModule } from "../../infrastructure/storage/storage.module";
import { WebsocketCoreModule } from "../../infrastructure/websocket/websocket-core.module";
import { HealthController } from "./health.controller";
import { HealthService } from "./health.service";
import { RootController } from "./root.controller";

@Module({
  imports: [DatabaseModule, RedisModule, StorageModule, EmailModule, WebsocketCoreModule],
  controllers: [RootController, HealthController],
  providers: [HealthService],
  exports: [HealthService],
})
export class HealthModule {}
