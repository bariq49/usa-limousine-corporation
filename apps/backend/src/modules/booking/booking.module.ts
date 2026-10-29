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
import { QuoteController } from "./controllers/quote.controller";
import { BookingRepository } from "./repositories/booking.repository";
import { QuoteRepository } from "./repositories/quote.repository";
import { BookingEmailService } from "./services/booking-email.service";
import { NotificationService } from "./services/notification.service";
import { BookingPricingService } from "./services/booking-pricing.service";
import { BookingSmsService } from "./services/booking-sms.service";
import { BookingService } from "./services/booking.service";
import { CustomerBookingService } from "./services/customer-booking.service";
import { QuoteService } from "./services/quote.service";
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
  controllers: [CustomerBookingController, BookingController, QuoteController],
  providers: [
    BookingRepository,
    QuoteRepository,
    BookingEmailService,
    BookingSmsService,
    NotificationService,
    BookingPricingService,
    BookingService,
    CustomerBookingService,
    QuoteService,
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
    QuoteService,
    ReceiptService,
  ],
})
export class BookingModule {}
