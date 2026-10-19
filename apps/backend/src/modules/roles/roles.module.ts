import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../infrastructure/database/database.module";
import { RolesRepository } from "./repositories/roles.repository";
import { RolesService } from "./services/roles.service";

@Module({
  imports: [DatabaseModule],
  providers: [RolesRepository, RolesService],
  exports: [RolesService],
})
export class RolesModule {}
