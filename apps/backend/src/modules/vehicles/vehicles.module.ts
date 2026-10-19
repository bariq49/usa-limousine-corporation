import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../infrastructure/database/database.module";
import { VehiclesController } from "./controllers/vehicles.controller";
import { VehicleRepository } from "./repositories/vehicle.repository";
import { VehicleService } from "./vehicles.service";

@Module({
  imports: [DatabaseModule],
  controllers: [VehiclesController],
  providers: [VehicleService, VehicleRepository],
  exports: [VehicleService],
})
export class VehicleModule {}
