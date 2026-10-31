import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../infrastructure/database/database.module";
import { EmailModule } from "../../infrastructure/email/email.module";
import { MapsModule } from "../../infrastructure/maps/maps.module";
import { SequenceModule } from "../../infrastructure/sequence/sequence.module";
import { AuthModule } from "../auth/auth.module";
import { NotificationModule } from "../notification/notification.module";
import { PlatformSettingsModule } from "../platform-settings/platform-settings.module";
import { VehicleCategoryModule } from "../vehicle-categories/vehicle-category.module";
import { BookingController } from "./controllers/booking.controller";
import { CustomerBookingController } from "./controllers/customer-booking.controller";
import { EstimateController } from "./controllers/estimate.controller";
import { BookingRepository } from "./repositories/booking.repository";
import { BookingEmailService } from "./services/email.service";
import { NotificationService } from "./services/notification.service";
import { BookingPricingService } from "./services/pricing.service";
import { BookingSmsService } from "./services/sms.service";
import { BookingService } from "./services/booking.service";
import { CustomerBookingService } from "./services/customer-booking.service";
import { EstimateService } from "./services/estimate.service";
import { ReceiptService } from "./services/receipt.service";

@Module({
  imports: [
    DatabaseModule,
    EmailModule,
    MapsModule,
    SequenceModule,
    AuthModule,
    NotificationModule,
    PlatformSettingsModule,
    VehicleCategoryModule,
  ],
  controllers: [CustomerBookingController, BookingController, EstimateController],
  providers: [
    BookingRepository,
    BookingEmailService,
    BookingSmsService,
    NotificationService,
    BookingPricingService,
    BookingService,
    CustomerBookingService,
    EstimateService,
    ReceiptService,
  ],
  exports: [
    BookingService,
    CustomerBookingService,
    BookingPricingService,
    BookingRepository,
    BookingEmailService,
    BookingSmsService,
    NotificationService,
    EstimateService,
    ReceiptService,
  ],
})
export class BookingModule {}
