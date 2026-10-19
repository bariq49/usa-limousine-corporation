import { Module } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { ThrottlerModule } from "@nestjs/throttler";
import { GlobalExceptionFilter } from "./common/filters/global-exception.filter";
import { LoggerModule } from "./common/logger/logger.module";
import { AppConfigModule } from "./config/config.module";
import { DatabaseModule } from "./infrastructure/database/database.module";
import { EmailModule } from "./infrastructure/email/email.module";
import { QueueRegistryModule } from "./infrastructure/queue/queue-registry";
import { RedisModule } from "./infrastructure/redis/redis.module";
import { StorageModule } from "./infrastructure/storage/storage.module";
import { FirebaseModule } from "./infrastructure/firebase/firebase.module";
import { StripeModule } from "./infrastructure/stripe/stripe.module";
import { AgoraModule } from "./infrastructure/agora/agora.module";
import { TwilioModule } from "./infrastructure/twilio/twilio.module";
import { WebsocketCoreModule } from "./infrastructure/websocket/websocket-core.module";
import { WebsocketModule } from "./infrastructure/websocket/websocket.module";
import { AuthModule } from "./modules/auth/auth.module";
import { HelpCenterModule } from "./modules/help-center/help-center.module";
import { HealthModule } from "./modules/health/health.module";
import { DriverModule } from "./modules/driver/driver.module";
import { BookingModule } from "./modules/booking/booking.module";
import { TripModule } from "./modules/trip/trip.module";
import { VehicleCategoryModule } from "./modules/vehicle-categories/vehicle-category.module";
import { VehicleModule } from "./modules/vehicles/vehicles.module";
import { PaymentModule } from "./modules/payment/payment.module";
import { PayoutModule } from "./modules/payout/payout.module";
import { PermissionsModule } from "./modules/permissions/permissions.module";
import { RolesModule } from "./modules/roles/roles.module";
import { SessionsModule } from "./modules/sessions/sessions.module";
import { UploadsModule } from "./modules/uploads/uploads.module";
import { UsersModule } from "./modules/users/users.module";
import { CustomerModule } from "./modules/customer/customer.module";
import { ActivityModule } from "./modules/activity/activity.module";
import { NotificationModule } from "./modules/notification/notification.module";
import { WalletModule } from "./modules/wallet/wallet.module";
import { SettingsModule } from "./modules/settings/settings.module";
import { SubscriptionModule } from "./modules/subscription/subscription.module";
import { CalendarModule } from "./modules/calendar/calendar.module";
import { ExtraServiceModule } from "./modules/extra-services/extra-service.module";
import { ChatModule } from "./modules/chat/chat.module";

@Module({
  imports: [
    AppConfigModule,
    LoggerModule,
    EventEmitterModule.forRoot(),
    DatabaseModule,
    RedisModule,
    QueueRegistryModule,
    WebsocketCoreModule,
    StorageModule,
    StripeModule,
    FirebaseModule,
    TwilioModule,
    AgoraModule,
    EmailModule,
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: 60_000,
          limit: config.get<string>("NODE_ENV") === "test" ? 1_000 : 60,
        },
      ],
    }),
    AuthModule,
    WebsocketModule,
    HealthModule,
    UploadsModule,
    UsersModule,
    CustomerModule,
    RolesModule,
    PermissionsModule,
    SessionsModule,
    DriverModule,
    ActivityModule,
    NotificationModule,
    WalletModule,
    SettingsModule,
    SubscriptionModule,
    CalendarModule,
    BookingModule,
    TripModule,
    HelpCenterModule,
    VehicleCategoryModule,
    VehicleModule,
    PaymentModule,
    PayoutModule,
    ExtraServiceModule,
    ChatModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
