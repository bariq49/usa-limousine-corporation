import { Module, forwardRef } from "@nestjs/common";
import { DatabaseModule } from "../../infrastructure/database/database.module";
import { HelpCenterModule } from "../help-center/help-center.module";
import { NotificationModule } from "../notification/notification.module";
import { UsersModule } from "../users/users.module";
import { AdminCustomerController } from "./controllers/admin.controller";
import { CustomerNotificationController } from "./controllers/notification.controller";
import { CustomerProfileController } from "./controllers/profile.controller";
import { CustomerTicketController } from "./controllers/ticket.controller";
import { CustomerRepository } from "./repositories/customer.repository";
import { CustomerNotificationService } from "./services/notification.service";
import { CustomerProfileService } from "./services/profile.service";
import { CustomerTicketService } from "./services/ticket.service";
import { CustomerService } from "./services/customer.service";

@Module({
  imports: [DatabaseModule, UsersModule, NotificationModule, forwardRef(() => HelpCenterModule)],
  controllers: [
    AdminCustomerController,
    CustomerProfileController,
    CustomerNotificationController,
    CustomerTicketController,
  ],
  providers: [
    CustomerRepository,
    CustomerService,
    CustomerProfileService,
    CustomerNotificationService,
    CustomerTicketService,
  ],
  exports: [CustomerService],
})
export class CustomerModule {}
