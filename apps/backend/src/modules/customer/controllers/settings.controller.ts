import { Body, Controller, Get, Inject, Patch, Req, UseGuards } from "@nestjs/common";
import { RoleKey } from "@prisma/client";
import type { Request } from "express";
import { Roles } from "../../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { UpdateSettingsDto } from "../dto/settings.dto";
import { CustomerSettingsService } from "../services/settings.service";

@Controller("customers")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleKey.CUSTOMER)
export class CustomerSettingsController {
  constructor(
    @Inject(CustomerSettingsService) private readonly settingsService: CustomerSettingsService,
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
