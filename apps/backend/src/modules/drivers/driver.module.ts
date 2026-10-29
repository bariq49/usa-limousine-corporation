import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../infrastructure/database/database.module";
import { EmailModule } from "../../infrastructure/email/email.module";
import { BookingModule } from "../booking/booking.module";
import { AdminDriverController } from "./controllers/admin.controller";
import { AssignmentController } from "./controllers/assignment.controller";
import { DriverRepository } from "./repositories/driver.repository";
import { AssignmentService } from "./services/assignment.service";
import { DriverService } from "./services/driver.service";

@Module({
  imports: [DatabaseModule, EmailModule, BookingModule],
  controllers: [AdminDriverController, AssignmentController],
  providers: [DriverRepository, DriverService, AssignmentService],
})
export class DriverModule {}
