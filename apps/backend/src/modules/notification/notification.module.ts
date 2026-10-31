import { Module, forwardRef } from "@nestjs/common";
import { DatabaseModule } from "../../infrastructure/database/database.module";
import { LoggerModule } from "../../common/logger/logger.module";
import { WebsocketCoreModule } from "../../infrastructure/websocket/websocket-core.module";
import { AuthModule } from "../auth/auth.module";
import { NotificationController } from "./controllers/notification.controller";
import { NotificationQueueService } from "./jobs/notification-queue.service";
import { NotificationRepository } from "./repositories/notification.repository";
import { NotificationService } from "./services/notification.service";
import { NotificationRealtimeService } from "./websocket/notification-realtime.service";

@Module({
  imports: [DatabaseModule, LoggerModule, WebsocketCoreModule, forwardRef(() => AuthModule)],
  controllers: [NotificationController],
  providers: [
    NotificationRepository,
    NotificationRealtimeService,
    NotificationService,
    NotificationQueueService,
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
