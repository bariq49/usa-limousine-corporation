import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../infrastructure/database/database.module";
import { PermissionsService } from "./permissions.service";

@Module({
  imports: [DatabaseModule],
  providers: [PermissionsService],
  exports: [PermissionsService],
})
export class PermissionsModule {}
