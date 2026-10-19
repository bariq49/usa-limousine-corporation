import { Body, Controller, Inject, Patch, Req, UseGuards } from "@nestjs/common";
import { RoleKey } from "@prisma/client";
import type { Request } from "express";
import { Roles } from "../../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { UpdateFcmTokenDto } from "../dto/fcm-token.dto";
import { DriverFcmTokenService } from "../services/fcm-token.service";

@Controller("drivers")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleKey.DRIVER)
export class DriverFcmTokenController {
  constructor(
    @Inject(DriverFcmTokenService) private readonly fcmTokenService: DriverFcmTokenService,
  ) {}

  @Patch("fcm-token")
  updateFcmToken(@Body() body: UpdateFcmTokenDto, @Req() request: Request) {
    return this.fcmTokenService.updateFcmToken(body, request);
  }
}
