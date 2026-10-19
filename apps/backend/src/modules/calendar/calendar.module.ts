import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../infrastructure/database/database.module";
import { CalendarRepository } from "./repositories/calendar.repository";
import { CalendarService } from "./services/calendar.service";

@Module({
  imports: [DatabaseModule],
  providers: [CalendarRepository, CalendarService],
  exports: [CalendarService, CalendarRepository],
})
export class CalendarModule {}
