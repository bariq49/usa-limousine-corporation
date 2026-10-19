import { Module, forwardRef } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { SessionsModule } from "../../modules/sessions/sessions.module";
import { UsersModule } from "../../modules/users/users.module";
import { DatabaseModule } from "../database/database.module";
import { RedisModule } from "../redis/redis.module";
import { WebsocketAuthService } from "./websocket-auth.service";
import { WebsocketCoreModule } from "./websocket-core.module";
import { WebsocketGateway } from "./websocket.gateway";
import { WebsocketPresenceService } from "./websocket-presence.service";
import { WebsocketRoomsService } from "./websocket-rooms.service";

@Module({
  imports: [
    WebsocketCoreModule,
    DatabaseModule,
    RedisModule,
    forwardRef(() => SessionsModule),
    UsersModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>("JWT_ACCESS_SECRET"),
      }),
    }),
  ],
  providers: [
    WebsocketAuthService,
    WebsocketRoomsService,
    WebsocketPresenceService,
    WebsocketGateway,
  ],
  exports: [WebsocketCoreModule],
})
export class WebsocketModule {}
