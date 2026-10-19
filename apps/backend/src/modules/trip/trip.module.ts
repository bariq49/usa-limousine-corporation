import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../infrastructure/database/database.module";
import { RedisModule } from "../../infrastructure/redis/redis.module";
import { WebsocketCoreModule } from "../../infrastructure/websocket/websocket-core.module";
import { AuthModule } from "../auth/auth.module";
import { BookingModule } from "../booking/booking.module";
import { DriverModule } from "../driver/driver.module";
import { NotificationModule } from "../notification/notification.module";
import { PaymentModule } from "../payment/payment.module";
import { SubscriptionModule } from "../subscription/subscription.module";
import { WalletModule } from "../wallet/wallet.module";
import { CalendarModule } from "../calendar/calendar.module";
import { SettingsModule } from "../settings/settings.module";
import { ChatModule } from "../chat/chat.module";
import { CustomerTripController } from "./controllers/customer-trip.controller";
import { TripController } from "./controllers/trip.controller";
import { TripRepository } from "./repositories/trip.repository";
import { CallService } from "./services/call.service";
import { LocationHistoryService } from "./services/location-history.service";
import { LocationStoreService } from "./services/location-store.service";
import { LocationService } from "./services/location.service";
import { TripService } from "./services/trip.service";
import { TripLocationGateway } from "./websocket/trip-location.gateway";
import { TripRealtimeService } from "./websocket/trip-realtime.service";

@Module({
  imports: [
    DatabaseModule,
    RedisModule,
    WebsocketCoreModule,
    AuthModule,
    DriverModule,
    NotificationModule,
    WalletModule,
    BookingModule,
    PaymentModule,
    SubscriptionModule,
    CalendarModule,
    SettingsModule,
    ChatModule,
  ],
  controllers: [TripController, CustomerTripController],
  providers: [
    TripRepository,
    TripService,
    CallService,
    LocationStoreService,
    LocationHistoryService,
    LocationService,
    TripRealtimeService,
    TripLocationGateway,
  ],
  exports: [TripService, TripRepository, LocationService, CallService],
})
export class TripModule {}
