import { Body, Controller, Delete, Get, Inject, Param, Query, UseGuards } from "@nestjs/common";
import { RoleKey } from "@prisma/client";
import { Roles } from "../../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { BulkDeleteDto } from "../dto/bulk-delete.dto";
import { QueryDto } from "../dto/query.dto";
import { VehicleService } from "../vehicles.service";

@Controller("admin/vehicles")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleKey.SUPER_ADMIN)
export class VehiclesController {
  constructor(
    @Inject(VehicleService)
    private readonly vehicleService: VehicleService,
  ) {}

  @Get()
  findAll(@Query() query: QueryDto) {
    return this.vehicleService.findAll(query);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.vehicleService.findById(id);
  }

  @Delete("bulk")
  bulkRemove(@Body() body: BulkDeleteDto) {
    return this.vehicleService.bulkRemove(body);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.vehicleService.remove(id);
  }
}
