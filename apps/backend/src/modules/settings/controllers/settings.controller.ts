import { Body, Controller, Delete, Get, Inject, Patch, Req, UseGuards } from "@nestjs/common";
import { RoleKey } from "@prisma/client";
import type { Request } from "express";
import { Roles } from "../../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { UpdateDto } from "../dto/settings.dto";
import { SettingsService } from "../services/settings.service";

@Controller("admin/settings")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleKey.SUPER_ADMIN)
export class SettingsController {
  constructor(@Inject(SettingsService) private readonly settings: SettingsService) {}

  @Get()
  get() {
    return this.settings.get();
  }

  @Patch()
  update(@Body() body: UpdateDto, @Req() request: Request) {
    return this.settings.update(body, request);
  }

  @Delete("clear-data")
  clearData() {
    return this.settings.clearData();
  }
}
