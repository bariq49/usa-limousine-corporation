import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../infrastructure/database/database.module";
import { SequenceModule } from "../../infrastructure/sequence/sequence.module";
import { AuthModule } from "../auth/auth.module";
import { NotificationModule } from "../notification/notification.module";
import { BookingController } from "./controllers/booking.controller";
import { CustomerBookingController } from "./controllers/customer-booking.controller";
import { BookingRepository } from "./repositories/booking.repository";
import { BookingService } from "./services/booking.service";

@Module({
  imports: [DatabaseModule, SequenceModule, AuthModule, NotificationModule],
  controllers: [CustomerBookingController, BookingController],
  providers: [BookingRepository, BookingService],
  exports: [BookingService, BookingRepository],
})
export class BookingModule {}
