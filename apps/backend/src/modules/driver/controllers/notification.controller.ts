import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { RoleKey } from "@prisma/client";
import type { Request } from "express";
import { Roles } from "../../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { BulkDeleteDto, QueryDto } from "../dto/notification.dto";
import { DriverNotificationService } from "../services/notification.service";

@Controller("drivers")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleKey.DRIVER)
export class DriverNotificationController {
  constructor(
    @Inject(DriverNotificationService)
    private readonly notificationService: DriverNotificationService,
  ) {}

  @Get("notifications")
  listNotifications(@Query() query: QueryDto, @Req() request: Request) {
    return this.notificationService.listNotifications(query, request);
  }

  @Patch("notifications/read-all")
  @HttpCode(HttpStatus.OK)
  markAllNotificationsRead(@Req() request: Request) {
    return this.notificationService.markAllNotificationsRead(request);
  }

  @Patch("notifications/:id/read")
  markNotificationRead(@Param("id") id: string, @Req() request: Request) {
    return this.notificationService.markNotificationRead(id, request);
  }

  @Delete("notifications/bulk")
  @HttpCode(HttpStatus.OK)
  removeNotifications(@Body() body: BulkDeleteDto, @Req() request: Request) {
    return this.notificationService.removeNotifications(body, request);
  }

  @Delete("notifications/:id")
  @HttpCode(HttpStatus.OK)
  removeNotification(@Param("id") id: string, @Req() request: Request) {
    return this.notificationService.removeNotification(id, request);
  }
}
