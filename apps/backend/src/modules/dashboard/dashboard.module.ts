import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../infrastructure/database/database.module";
import { DashboardController } from "./controllers/dashboard.controller";
import { DashboardRepository } from "./repositories/dashboard.repository";
import { DashboardService } from "./services/dashboard.service";

@Module({
  imports: [DatabaseModule],
  controllers: [DashboardController],
  providers: [DashboardRepository, DashboardService],
})
export class DashboardModule {}
