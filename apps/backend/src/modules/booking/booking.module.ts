import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../infrastructure/database/database.module";
import { EmailModule } from "../../infrastructure/email/email.module";
import { SequenceModule } from "../../infrastructure/sequence/sequence.module";
import { AuthModule } from "../auth/auth.module";
import { NotificationModule } from "../notification/notification.module";
import { PlatformSettingsModule } from "../platform-settings/platform-settings.module";
import { VehicleCategoryModule } from "../vehicle-categories/vehicle-category.module";
import { BookingController } from "./controllers/booking.controller";
import { CustomerBookingController } from "./controllers/customer-booking.controller";
import { BookingRepository } from "./repositories/booking.repository";
import { BookingEmailService } from "./services/booking-email.service";
import { BookingService } from "./services/booking.service";

@Module({
  imports: [
    DatabaseModule,
    EmailModule,
    SequenceModule,
    AuthModule,
    NotificationModule,
    PlatformSettingsModule,
    VehicleCategoryModule,
  ],
  controllers: [CustomerBookingController, BookingController],
  providers: [BookingRepository, BookingEmailService, BookingService],
  exports: [BookingService, BookingRepository, BookingEmailService],
})
export class BookingModule {}
