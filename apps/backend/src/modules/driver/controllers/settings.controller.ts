import { Body, Controller, Get, Inject, Patch, Req, UseGuards } from "@nestjs/common";
import { RoleKey } from "@prisma/client";
import type { Request } from "express";
import { Roles } from "../../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { UpdateSettingsDto } from "../dto/settings.dto";
import { DriverSettingsService } from "../services/settings.service";

@Controller("drivers")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleKey.DRIVER)
export class DriverSettingsController {
  constructor(
    @Inject(DriverSettingsService) private readonly settingsService: DriverSettingsService,
  ) {}

  @Get("settings")
  getSettings(@Req() request: Request) {
    return this.settingsService.getSettings(request);
  }

  @Patch("settings")
  updateSettings(@Body() body: UpdateSettingsDto, @Req() request: Request) {
    return this.settingsService.updateSettings(body, request);
  }
}
