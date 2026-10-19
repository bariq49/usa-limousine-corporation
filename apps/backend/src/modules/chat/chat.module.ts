import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../infrastructure/database/database.module";
import { RedisModule } from "../../infrastructure/redis/redis.module";
import { WebsocketCoreModule } from "../../infrastructure/websocket/websocket-core.module";
import { AuthModule } from "../auth/auth.module";
import { NotificationModule } from "../notification/notification.module";
import { ChatController } from "./controllers/chat.controller";
import { TripChatPolicy } from "./policies/trip-chat.policy";
import { ConversationRepository } from "./repositories/conversation.repository";
import { MessageRepository } from "./repositories/message.repository";
import { ChatRateLimitService } from "./services/chat-rate-limit.service";
import { ChatRealtimeService } from "./services/chat-realtime.service";
import { ChatService } from "./services/chat.service";
import { ChatGateway } from "./websocket/chat.gateway";

@Module({
  imports: [DatabaseModule, AuthModule, WebsocketCoreModule, NotificationModule, RedisModule],
  controllers: [ChatController],
  providers: [
    ConversationRepository,
    MessageRepository,
    ChatRealtimeService,
    ChatRateLimitService,
    TripChatPolicy,
    ChatService,
    ChatGateway,
  ],
  exports: [ChatService, TripChatPolicy],
})
export class ChatModule {}
