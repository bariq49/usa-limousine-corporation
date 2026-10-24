import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../infrastructure/database/database.module";
import { SequenceModule } from "../../infrastructure/sequence/sequence.module";
import { BookingModule } from "../booking/booking.module";
import { NotificationModule } from "../notification/notification.module";
import { PlatformSettingsModule } from "../platform-settings/platform-settings.module";
import { CheckoutController } from "./controllers/checkout.controller";
import { PaymentRepository } from "./repositories/payment.repository";
import { PaymentService } from "./services/payment.service";

@Module({
  imports: [
    DatabaseModule,
    SequenceModule,
    BookingModule,
    NotificationModule,
    PlatformSettingsModule,
  ],
  controllers: [CheckoutController],
  providers: [PaymentRepository, PaymentService],
})
export class PaymentModule {}
