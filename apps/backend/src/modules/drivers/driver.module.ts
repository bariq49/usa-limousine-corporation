import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../infrastructure/database/database.module";
import { EmailModule } from "../../infrastructure/email/email.module";
import { TwilioModule } from "../../infrastructure/twilio/twilio.module";
import { BookingModule } from "../booking/booking.module";
import { AdminDriverController } from "./controllers/admin.controller";
import { AssignmentController } from "./controllers/assignment.controller";
import { DriverRepository } from "./repositories/driver.repository";
import { AssignmentService } from "./services/assignment.service";
import { DriverEmailService } from "./services/driver-email.service";
import { DriverSmsService } from "./services/driver-sms.service";
import { DriverService } from "./services/driver.service";

@Module({
  imports: [DatabaseModule, EmailModule, TwilioModule, BookingModule],
  controllers: [AdminDriverController, AssignmentController],
  providers: [
    DriverRepository,
    DriverService,
    AssignmentService,
    DriverEmailService,
    DriverSmsService,
  ],
})
export class DriverModule {}
