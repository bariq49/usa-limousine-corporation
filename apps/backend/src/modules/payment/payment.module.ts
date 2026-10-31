import { Module, forwardRef } from "@nestjs/common";
import { DatabaseModule } from "../../infrastructure/database/database.module";
import { SequenceModule } from "../../infrastructure/sequence/sequence.module";
import { AuthModule } from "../auth/auth.module";
import { BookingModule } from "../booking/booking.module";
import { NotificationModule } from "../notification/notification.module";
import { PlatformSettingsModule } from "../platform-settings/platform-settings.module";
import { AdminPaymentController } from "./controllers/admin.controller";
import { AdminRefundController } from "./controllers/admin-refund.controller";
import { CheckoutController } from "./controllers/checkout.controller";
import { CustomerPaymentController } from "./controllers/customer.controller";
import { CustomerRefundController } from "./controllers/customer-refund.controller";
import { PaymentRepository } from "./repositories/payment.repository";
import { PaymentService } from "./services/payment.service";

@Module({
  imports: [
    DatabaseModule,
    SequenceModule,
    forwardRef(() => AuthModule),
    BookingModule,
    NotificationModule,
    PlatformSettingsModule,
  ],
  controllers: [
    AdminPaymentController,
    AdminRefundController,
    CustomerPaymentController,
    CustomerRefundController,
    CheckoutController,
  ],
  providers: [PaymentRepository, PaymentService],
  exports: [PaymentService, PaymentRepository],
})
export class PaymentModule {}
