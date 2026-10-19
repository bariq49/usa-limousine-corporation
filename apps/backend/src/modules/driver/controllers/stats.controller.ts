import { Controller, Get, Inject, Req, UseGuards } from "@nestjs/common";
import { RoleKey } from "@prisma/client";
import type { Request } from "express";
import { Roles } from "../../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { DriverStatsService } from "../services/stats.service";

@Controller("drivers")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleKey.DRIVER)
export class DriverStatsController {
  constructor(@Inject(DriverStatsService) private readonly stats: DriverStatsService) {}

  @Get("stats")
  getStats(@Req() request: Request) {
    return this.stats.getStats(request);
  }
}
