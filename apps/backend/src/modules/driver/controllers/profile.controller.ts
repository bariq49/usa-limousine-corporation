import { Body, Controller, Get, Inject, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { RoleKey } from "@prisma/client";
import type { Request } from "express";
import { Roles } from "../../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { DeleteDto, UpdateProfileDto } from "../dto/profile.dto";
import { DriverProfileService } from "../services/profile.service";

@Controller("drivers")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleKey.DRIVER)
export class DriverProfileController {
  constructor(
    @Inject(DriverProfileService) private readonly profileService: DriverProfileService,
  ) {}

  @Get("profile")
  getProfile(@Req() request: Request) {
    return this.profileService.getProfile(request);
  }

  @Patch("profile")
  updateProfile(@Body() body: UpdateProfileDto, @Req() request: Request) {
    return this.profileService.updateProfile(body, request);
  }

  @Get("me")
  getMe(@Req() request: Request) {
    return this.profileService.getMe(request);
  }

  @Get("reviews")
  getReviews(@Req() request: Request) {
    return this.profileService.getReviews(request);
  }

  @Post("delete-request")
  requestDelete(@Body() body: DeleteDto, @Req() request: Request) {
    return this.profileService.requestDelete(body, request);
  }
}
