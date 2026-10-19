import { Body, Controller, Get, Inject, Patch, Req, UseGuards } from "@nestjs/common";
import { RoleKey } from "@prisma/client";
import type { Request } from "express";
import { Roles } from "../../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { UpdateVehicleDto } from "../dto/vehicle.dto";
import { DriverVehicleService } from "../services/vehicle.service";

@Controller("drivers")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleKey.DRIVER)
export class DriverVehicleController {
  constructor(
    @Inject(DriverVehicleService) private readonly vehicleService: DriverVehicleService,
  ) {}

  @Get("vehicle")
  getVehicle(@Req() request: Request) {
    return this.vehicleService.getVehicle(request);
  }

  @Patch("vehicle")
  updateVehicle(@Body() body: UpdateVehicleDto, @Req() request: Request) {
    return this.vehicleService.updateVehicle(body, request);
  }
}
