import { Body, Controller, Get, Inject, Patch, Req, UseGuards } from "@nestjs/common";
import { RoleKey } from "@prisma/client";
import type { Request } from "express";
import { Roles } from "../../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { UpdateDto } from "../dto/update.dto";
import { PlatformSettingsService } from "../services/platform-settings.service";

@Controller("admin/settings/platform")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleKey.SUPER_ADMIN)
export class AdminController {
  constructor(
    @Inject(PlatformSettingsService)
    private readonly service: PlatformSettingsService,
  ) {}

  @Get()
  get() {
    return this.service.get();
  }

  @Patch()
  update(@Body() body: UpdateDto, @Req() request: Request) {
    return this.service.update(body, request);
  }
}
