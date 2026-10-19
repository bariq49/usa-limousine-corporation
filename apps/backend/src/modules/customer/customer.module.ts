import { Module, forwardRef } from "@nestjs/common";
import { DatabaseModule } from "../../infrastructure/database/database.module";
import { HelpCenterModule } from "../help-center/help-center.module";
import { NotificationModule } from "../notification/notification.module";
import { PaymentModule } from "../payment/payment.module";
import { UsersModule } from "../users/users.module";
import { CustomerFcmTokenController } from "./controllers/fcm-token.controller";
import { CustomerNotificationController } from "./controllers/notification.controller";
import { CustomerPaymentMethodController } from "./controllers/payment-method.controller";
import { CustomerProfileController } from "./controllers/profile.controller";
import { CustomerSettingsController } from "./controllers/settings.controller";
import { CustomerTicketController } from "./controllers/ticket.controller";
import { TicketNotifyListener } from "./listeners/ticket-notify.listener";
import { CustomerRepository } from "./repositories/customer.repository";
import { CustomerSettingsRepository } from "./repositories/settings.repository";
import { CustomerFcmTokenService } from "./services/fcm-token.service";
import { CustomerNotificationService } from "./services/notification.service";
import { CustomerPaymentMethodService } from "./services/payment-method.service";
import { CustomerProfileService } from "./services/profile.service";
import { CustomerTokenResolver } from "./services/push-token.resolver";
import { CustomerChannel } from "./services/recipient-channel";
import { CustomerSettingsService } from "./services/settings.service";
import { CustomerTicketService } from "./services/ticket.service";
import { CustomerService } from "./services/customer.service";

@Module({
  imports: [
    DatabaseModule,
    UsersModule,
    NotificationModule,
    forwardRef(() => HelpCenterModule),
    forwardRef(() => PaymentModule),
  ],
  controllers: [
    CustomerProfileController,
    CustomerSettingsController,
    CustomerNotificationController,
    CustomerFcmTokenController,
    CustomerPaymentMethodController,
    CustomerTicketController,
  ],
  providers: [
    CustomerRepository,
    CustomerSettingsRepository,
    CustomerService,
    CustomerProfileService,
    CustomerSettingsService,
    CustomerNotificationService,
    CustomerFcmTokenService,
    CustomerTokenResolver,
    CustomerChannel,
    CustomerPaymentMethodService,
    CustomerTicketService,
    TicketNotifyListener,
  ],
  exports: [CustomerService],
})
export class CustomerModule {}
