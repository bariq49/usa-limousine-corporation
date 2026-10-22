import { Module, forwardRef } from "@nestjs/common";
import { DatabaseModule } from "../../infrastructure/database/database.module";
import { HelpCenterModule } from "../help-center/help-center.module";
import { NotificationModule } from "../notification/notification.module";
import { UsersModule } from "../users/users.module";
import { AdminCustomerController } from "./controllers/admin.controller";
import { CustomerFcmTokenController } from "./controllers/fcm-token.controller";
import { CustomerNotificationController } from "./controllers/notification.controller";
import { CustomerProfileController } from "./controllers/profile.controller";
import { CustomerSettingsController } from "./controllers/settings.controller";
import { CustomerTicketController } from "./controllers/ticket.controller";
import { CustomerRepository } from "./repositories/customer.repository";
import { CustomerSettingsRepository } from "./repositories/settings.repository";
import { CustomerFcmTokenService } from "./services/fcm-token.service";
import { CustomerNotificationService } from "./services/notification.service";
import { CustomerProfileService } from "./services/profile.service";
import { CustomerTokenResolver } from "./services/push-token.resolver";
import { CustomerChannel } from "./services/recipient-channel";
import { CustomerSettingsService } from "./services/settings.service";
import { CustomerTicketService } from "./services/ticket.service";
import { CustomerService } from "./services/customer.service";

@Module({
  imports: [DatabaseModule, UsersModule, NotificationModule, forwardRef(() => HelpCenterModule)],
  controllers: [
    AdminCustomerController,
    CustomerProfileController,
    CustomerSettingsController,
    CustomerNotificationController,
    CustomerFcmTokenController,
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
    CustomerTicketService,
  ],
  exports: [CustomerService],
})
export class CustomerModule {}
