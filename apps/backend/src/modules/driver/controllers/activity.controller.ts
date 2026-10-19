import { Controller, Get, Inject, Query, Req, UseGuards } from "@nestjs/common";
import { RoleKey } from "@prisma/client";
import type { Request } from "express";
import { Roles } from "../../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { QueryDto } from "../dto/activity.dto";
import { DriverActivityService } from "../services/activity.service";

@Controller("drivers")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleKey.DRIVER)
export class DriverActivityController {
  constructor(@Inject(DriverActivityService) private readonly activity: DriverActivityService) {}

  @Get("activity")
  getActivity(@Req() request: Request, @Query() query: QueryDto) {
    return this.activity.getActivity(request, query);
  }
}
