import { Module } from "@nestjs/common";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { LoggerModule } from "./common/logger/logger.module";
import { AppConfigModule } from "./config/config.module";
import { DatabaseModule } from "./infrastructure/database/database.module";
import { EmailModule } from "./infrastructure/email/email.module";
import { FirebaseModule } from "./infrastructure/firebase/firebase.module";
import { QueueRegistryModule } from "./infrastructure/queue/queue-registry";
import { RedisModule } from "./infrastructure/redis/redis.module";
import { StripeModule } from "./infrastructure/stripe/stripe.module";
import { TwilioModule } from "./infrastructure/twilio/twilio.module";
import { WebsocketCoreModule } from "./infrastructure/websocket/websocket-core.module";
import { AuthModule } from "./modules/auth/auth.module";
import { BookingModule } from "./modules/booking/booking.module";
import { DriverModule } from "./modules/driver/driver.module";
import { NotificationModule } from "./modules/notification/notification.module";
import { PaymentModule } from "./modules/payment/payment.module";
import { PayoutModule } from "./modules/payout/payout.module";

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
    StripeModule,
    WebsocketCoreModule,
    AuthModule,
    NotificationModule,
    DriverModule,
    PaymentModule,
    PayoutModule,
    BookingModule,
  ],
})
export class WorkerModule {}
