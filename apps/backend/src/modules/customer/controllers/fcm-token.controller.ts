import { Body, Controller, Inject, Patch, Req, UseGuards } from "@nestjs/common";
import { RoleKey } from "@prisma/client";
import type { Request } from "express";
import { Roles } from "../../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { UpdateFcmTokenDto } from "../dto/fcm-token.dto";
import { CustomerFcmTokenService } from "../services/fcm-token.service";

@Controller("customers")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleKey.CUSTOMER)
export class CustomerFcmTokenController {
  constructor(
    @Inject(CustomerFcmTokenService) private readonly fcmTokenService: CustomerFcmTokenService,
  ) {}

  @Patch("fcm-token")
  updateFcmToken(@Body() body: UpdateFcmTokenDto, @Req() request: Request) {
    return this.fcmTokenService.updateFcmToken(body, request);
  }
}
