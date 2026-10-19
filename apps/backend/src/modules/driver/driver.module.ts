import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../infrastructure/database/database.module";
import { EmailModule } from "../../infrastructure/email/email.module";
import { SequenceModule } from "../../infrastructure/sequence/sequence.module";
import { RedisModule } from "../../infrastructure/redis/redis.module";
import { WebsocketCoreModule } from "../../infrastructure/websocket/websocket-core.module";
import { ActivityModule } from "../activity/activity.module";
import { AuthModule } from "../auth/auth.module";
import { HelpCenterModule } from "../help-center/help-center.module";
import { NotificationModule } from "../notification/notification.module";
import { RolesModule } from "../roles/roles.module";
import { SubscriptionModule } from "../subscription/subscription.module";
import { CalendarModule } from "../calendar/calendar.module";
import { PaymentModule } from "../payment/payment.module";
import { PayoutModule } from "../payout/payout.module";
import { SessionsModule } from "../sessions/sessions.module";
import { SettingsModule } from "../settings/settings.module";
import { UsersModule } from "../users/users.module";
import { WalletModule } from "../wallet/wallet.module";
import { DriverAdminController } from "./controllers/admin.controller";
import { DriverBankAccountController } from "./controllers/bank-account.controller";
import { DriverDocumentsController } from "./controllers/documents.controller";
import { DriverFcmTokenController } from "./controllers/fcm-token.controller";
import { DriverTicketController } from "./controllers/ticket.controller";
import { DriverNotificationController } from "./controllers/notification.controller";
import { DriverPresenceController } from "./controllers/presence.controller";
import { DriverProfileController } from "./controllers/profile.controller";
import { DriverRegisterController } from "./controllers/register.controller";
import { DriverSettingsController } from "./controllers/settings.controller";
import { DriverSubscriptionController } from "./controllers/subscription.controller";
import { DriverPaymentMethodController } from "./controllers/payment-method.controller";
import { DriverVehicleController } from "./controllers/vehicle.controller";
import { DriverStatsController } from "./controllers/stats.controller";
import { DriverActivityController } from "./controllers/activity.controller";
import { DriverPayoutController } from "./controllers/payout.controller";
import { DriverCalendarController } from "./controllers/calendar.controller";
import { DriverWalletController } from "./controllers/wallet.controller";
import { DriverEmailQueueService } from "./jobs/driver-email-queue.service";
import { DriverApplicationRepository } from "./repositories/application.repository";
import { DriverBankAccountRepository } from "./repositories/bank-account.repository";
import { DriverCalendarRepository } from "./repositories/calendar.repository";
import { DriverDocumentsRepository } from "./repositories/documents.repository";
import { DriverRepository } from "./repositories/driver.repository";
import { DriverPresenceRepository } from "./repositories/presence.repository";
import { DriverProfileRepository } from "./repositories/profile.repository";
import { DriverRegisterRepository } from "./repositories/register.repository";
import { DriverSettingsRepository } from "./repositories/settings.repository";
import { DriverStatsRepository } from "./repositories/stats.repository";
import { DriverRequestEventRepository } from "./repositories/request-event.repository";
import { DriverSubscriptionRepository } from "./repositories/subscription.repository";
import { DriverVehicleRepository } from "./repositories/vehicle.repository";
import { DriverApplicationService } from "./services/application.service";
import { DriverBankAccountService } from "./services/bank-account.service";
import { DriverDocumentsService } from "./services/documents.service";
import { DriverEmailService } from "./services/driver-email.service";
import { DriverFcmTokenService } from "./services/fcm-token.service";
import { TicketNotifyListener } from "./listeners/ticket-notify.listener";
import { DriverTicketService } from "./services/ticket.service";
import { DriverNotificationService } from "./services/notification.service";
import { DriverTokenResolver } from "./services/push-token.resolver";
import { DriverChannel } from "./services/recipient-channel";
import { DriverPresenceService } from "./services/presence.service";
import { DriverProfileService } from "./services/profile.service";
import { DriverRegisterService } from "./services/register.service";
import { DriverSettingsService } from "./services/settings.service";
import { DriverStatsService } from "./services/stats.service";
import { DriverActivityService } from "./services/activity.service";
import { DriverRequestEventService } from "./services/request-event.service";
import { DriverSubscriptionService } from "./services/subscription.service";
import { DriverPaymentMethodService } from "./services/payment-method.service";
import { DriverVehicleService } from "./services/vehicle.service";
import { DriverPayoutService } from "./services/payout.service";
import { DriverWalletService } from "./services/wallet.service";
import { DriverWalletSummaryService } from "./services/wallet-summary.service";
import { DriverGeoService } from "./services/geo.service";
import { DriverRealtimeService } from "./websocket/driver-realtime.service";

@Module({
  imports: [
    DatabaseModule,
    SequenceModule,
    EmailModule,
    AuthModule,
    UsersModule,
    RolesModule,
    ActivityModule,
    NotificationModule,
    WalletModule,
    HelpCenterModule,
    WebsocketCoreModule,
    RedisModule,
    SubscriptionModule,
    CalendarModule,
    PaymentModule,
    PayoutModule,
    SessionsModule,
    SettingsModule,
  ],
  controllers: [
    DriverRegisterController,
    DriverProfileController,
    DriverPresenceController,
    DriverFcmTokenController,
    DriverNotificationController,
    DriverTicketController,
    DriverWalletController,
    DriverPayoutController,
    DriverStatsController,
    DriverActivityController,
    DriverVehicleController,
    DriverDocumentsController,
    DriverSettingsController,
    DriverBankAccountController,
    DriverSubscriptionController,
    DriverPaymentMethodController,
    DriverCalendarController,
    DriverAdminController,
  ],
  providers: [
    DriverRepository,
    DriverRegisterRepository,
    DriverProfileRepository,
    DriverVehicleRepository,
    DriverDocumentsRepository,
    DriverSettingsRepository,
    DriverStatsRepository,
    DriverRequestEventRepository,
    DriverBankAccountRepository,
    DriverApplicationRepository,
    DriverPresenceRepository,
    DriverSubscriptionRepository,
    DriverCalendarRepository,
    DriverEmailService,
    DriverEmailQueueService,
    DriverRealtimeService,
    DriverRegisterService,
    DriverProfileService,
    DriverVehicleService,
    DriverDocumentsService,
    DriverSettingsService,
    DriverBankAccountService,
    DriverApplicationService,
    DriverPresenceService,
    DriverFcmTokenService,
    DriverTokenResolver,
    DriverChannel,
    DriverNotificationService,
    DriverTicketService,
    TicketNotifyListener,
    DriverWalletService,
    DriverWalletSummaryService,
    DriverPayoutService,
    DriverStatsService,
    DriverActivityService,
    DriverRequestEventService,
    DriverSubscriptionService,
    DriverPaymentMethodService,
    DriverGeoService,
  ],
  exports: [
    DriverRepository,
    DriverWalletService,
    DriverRegisterService,
    DriverProfileService,
    DriverVehicleService,
    DriverDocumentsService,
    DriverSettingsService,
    DriverBankAccountService,
    DriverApplicationService,
    DriverPresenceService,
    DriverSubscriptionService,
    DriverPaymentMethodService,
    DriverRealtimeService,
    DriverPresenceRepository,
    DriverGeoService,
    DriverCalendarRepository,
    DriverRequestEventService,
  ],
})
export class DriverModule {}
