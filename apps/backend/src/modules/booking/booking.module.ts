import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../infrastructure/database/database.module";
import { RedisModule } from "../../infrastructure/redis/redis.module";
import { SequenceModule } from "../../infrastructure/sequence/sequence.module";
import { WebsocketCoreModule } from "../../infrastructure/websocket/websocket-core.module";
import { AuthModule } from "../auth/auth.module";
import { DriverModule } from "../driver/driver.module";
import { NotificationModule } from "../notification/notification.module";
import { PaymentModule } from "../payment/payment.module";
import { SettingsModule } from "../settings/settings.module";
import { BookingController } from "./controllers/booking.controller";
import { CustomerBookingController } from "./controllers/customer-booking.controller";
import { OfferController } from "./controllers/offer.controller";
import { BookingPaymentListener } from "./listeners/payment.listener";
import { BookingQueueService } from "./jobs/booking-queue.service";
import { BookingRepository } from "./repositories/booking.repository";
import { OfferRepository } from "./repositories/offer.repository";
import { BookingService } from "./services/booking.service";
import { MatchingService } from "./services/matching.service";
import { NotifyService } from "./services/notify.service";
import { OfferCacheService } from "./services/offer-cache.service";
import { OfferMetricsService } from "./services/offer-metrics.service";
import { OfferRateLimitService } from "./services/offer-rate-limit.service";
import { OfferRealtimeService } from "./services/offer-realtime.service";
import { OfferService } from "./services/offer.service";
import { CheckoutRegistrar } from "./validators/checkout.registrar";
import { CheckoutValidator } from "./validators/checkout.validator";
import { RealtimeService } from "./websocket/realtime.service";

@Module({
  imports: [
    DatabaseModule,
    SequenceModule,
    AuthModule,
    DriverModule,
    PaymentModule,
    NotificationModule,
    WebsocketCoreModule,
    RedisModule,
    SettingsModule,
  ],
  controllers: [CustomerBookingController, BookingController, OfferController],
  providers: [
    BookingRepository,
    OfferRepository,
    BookingService,
    NotifyService,
    OfferCacheService,
    OfferRateLimitService,
    OfferMetricsService,
    OfferRealtimeService,
    MatchingService,
    OfferService,
    BookingPaymentListener,
    CheckoutValidator,
    CheckoutRegistrar,
    RealtimeService,
    BookingQueueService,
  ],
  exports: [BookingService, BookingRepository, NotifyService, OfferService],
})
export class BookingModule {}
