import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../infrastructure/database/database.module";
import { ActivityRepository } from "./repositories/activity.repository";
import { ActivityService } from "./services/activity.service";

@Module({
  imports: [DatabaseModule],
  providers: [ActivityRepository, ActivityService],
  exports: [ActivityService],
})
export class ActivityModule {}
