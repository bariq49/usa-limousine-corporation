import { Body, Controller, Get, Inject, Patch, Req, UseGuards } from "@nestjs/common";
import { RoleKey } from "@prisma/client";
import type { Request } from "express";
import { Roles } from "../../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { UpdateProfileDto } from "../dto/profile.dto";
import { CustomerProfileService } from "../services/profile.service";

@Controller("customers")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleKey.CUSTOMER)
export class CustomerProfileController {
  constructor(@Inject(CustomerProfileService) private readonly profiles: CustomerProfileService) {}

  @Get("profile")
  getProfile(@Req() request: Request) {
    return this.profiles.getProfile(request);
  }

  @Patch("profile")
  updateProfile(@Body() body: UpdateProfileDto, @Req() request: Request) {
    return this.profiles.updateProfile(body, request);
  }
}
