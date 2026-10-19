import { Module, forwardRef } from "@nestjs/common";
import { DatabaseModule } from "../../infrastructure/database/database.module";
import { LoggerModule } from "../../common/logger/logger.module";
import { WebsocketCoreModule } from "../../infrastructure/websocket/websocket-core.module";
import { AuthModule } from "../auth/auth.module";
import { NotificationController } from "./controllers/notification.controller";
import { NotificationQueueService } from "./jobs/notification-queue.service";
import { NotificationRepository } from "./repositories/notification.repository";
import { NotificationDeliveryService } from "./services/notification-delivery.service";
import { PushDeliveryService } from "./services/push-delivery.service";
import { TokenResolverRegistry } from "./services/push-token-resolver.registry";
import { ChannelRegistry } from "./services/recipient-channel.registry";
import { NotificationService } from "./services/notification.service";
import { TestPushService } from "./services/test-push.service";
import { NotificationRealtimeService } from "./websocket/notification-realtime.service";

@Module({
  imports: [DatabaseModule, LoggerModule, WebsocketCoreModule, forwardRef(() => AuthModule)],
  controllers: [NotificationController],
  providers: [
    NotificationRepository,
    NotificationRealtimeService,
    PushDeliveryService,
    TokenResolverRegistry,
    ChannelRegistry,
    NotificationDeliveryService,
    NotificationService,
    NotificationQueueService,
    TestPushService,
  ],
  exports: [
    NotificationService,
    NotificationRealtimeService,
    NotificationQueueService,
    TokenResolverRegistry,
    ChannelRegistry,
  ],
})
export class NotificationModule {}
