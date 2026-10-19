import { Body, Controller, Get, Inject, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";
import { RoleKey } from "@prisma/client";
import type { Request } from "express";
import { Roles } from "../../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { AvailableQueryDto, CreateDto } from "../dto/offer.dto";
import { OfferService } from "../services/offer.service";

@Controller("offers")
@UseGuards(JwtAuthGuard, RolesGuard, ThrottlerGuard)
@Roles(RoleKey.DRIVER)
export class OfferController {
  constructor(@Inject(OfferService) private readonly offerService: OfferService) {}

  @Get("available")
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  listAvailable(@Query() query: AvailableQueryDto, @Req() request: Request) {
    return this.offerService.listAvailableForDriver(query, request);
  }

  @Post()
  @Throttle({ default: { limit: 40, ttl: 60_000 } })
  create(@Body() body: CreateDto, @Req() request: Request) {
    return this.offerService.quote(body, request);
  }

  @Post("available/:bookingId/decline")
  @Throttle({ default: { limit: 40, ttl: 60_000 } })
  declineAvailable(@Param("bookingId") bookingId: string, @Req() request: Request) {
    return this.offerService.declineAvailable(bookingId, request);
  }
}
