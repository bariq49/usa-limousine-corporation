import { Body, Controller, Get, Inject, Post, Req, UseGuards } from "@nestjs/common";
import { RoleKey } from "@prisma/client";
import type { Request } from "express";
import { Roles } from "../../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { DowngradeDto, RenewDto, SubscribeDto, UpgradeDto } from "../dto/subscription.dto";
import { DriverSubscriptionService } from "../services/subscription.service";

@Controller("drivers/subscriptions")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleKey.DRIVER)
export class DriverSubscriptionController {
  constructor(
    @Inject(DriverSubscriptionService)
    private readonly subscriptionService: DriverSubscriptionService,
  ) {}

  @Get("plans")
  plans(@Req() request: Request) {
    return this.subscriptionService.listPlans(request);
  }

  @Get("me")
  me(@Req() request: Request) {
    return this.subscriptionService.getMine(request);
  }

  @Post("subscribe")
  subscribe(@Body() body: SubscribeDto, @Req() request: Request) {
    return this.subscriptionService.subscribe(body, request);
  }

  @Post("renew")
  renew(@Body() body: RenewDto, @Req() request: Request) {
    return this.subscriptionService.renew(body, request);
  }

  @Post("upgrade")
  upgrade(@Body() body: UpgradeDto, @Req() request: Request) {
    return this.subscriptionService.upgrade(body, request);
  }

  @Post("downgrade")
  downgrade(@Body() body: DowngradeDto, @Req() request: Request) {
    return this.subscriptionService.downgrade(body, request);
  }

  @Post("cancel")
  cancel(@Req() request: Request) {
    return this.subscriptionService.cancel(request);
  }

  @Post("resume")
  resume(@Req() request: Request) {
    return this.subscriptionService.resume(request);
  }
}
