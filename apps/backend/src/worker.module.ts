import { Module } from "@nestjs/common";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { LoggerModule } from "./common/logger/logger.module";
import { AppConfigModule } from "./config/config.module";
import { DatabaseModule } from "./infrastructure/database/database.module";
import { EmailModule } from "./infrastructure/email/email.module";
import { FirebaseModule } from "./infrastructure/firebase/firebase.module";
import { QueueRegistryModule } from "./infrastructure/queue/queue-registry";
import { RedisModule } from "./infrastructure/redis/redis.module";
import { TwilioModule } from "./infrastructure/twilio/twilio.module";
import { WebsocketCoreModule } from "./infrastructure/websocket/websocket-core.module";
import { AuthModule } from "./modules/auth/auth.module";
import { BlogModule } from "./modules/blogs/blog.module";
import { CustomerModule } from "./modules/customer/customer.module";
import { NotificationModule } from "./modules/notification/notification.module";

@Module({
  imports: [
    AppConfigModule,
    LoggerModule,
    EventEmitterModule.forRoot(),
    DatabaseModule,
    RedisModule,
    QueueRegistryModule,
    EmailModule,
    FirebaseModule,
    TwilioModule,
    WebsocketCoreModule,
    AuthModule,
    BlogModule,
    NotificationModule,
    // Registers the USER socket channel + push-token resolver used by the delivery sweep.
    CustomerModule,
  ],
})
export class WorkerModule {}
