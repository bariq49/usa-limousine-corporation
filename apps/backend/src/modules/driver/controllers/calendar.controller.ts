import { Controller, Get, Inject, Req, UseGuards } from "@nestjs/common";
import { RoleKey } from "@prisma/client";
import type { Request } from "express";
import { Roles } from "../../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { DriverCalendarRepository } from "../repositories/calendar.repository";
import { DriverRepository } from "../repositories/driver.repository";
import { requireDriver } from "../utils/require-driver";
import { Query } from "@nestjs/common";
import { CalendarQueryDto } from "../dto/calendar.dto";

@Controller("drivers/calendar")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleKey.DRIVER)
export class DriverCalendarController {
  constructor(
    @Inject(DriverCalendarRepository) private readonly calendarRepository: DriverCalendarRepository,
    @Inject(DriverRepository) private readonly driverRepository: DriverRepository,
  ) {}

  @Get()
  async getCalendar(@Req() request: Request, @Query() query: CalendarQueryDto) {
    const driver = await requireDriver(this.driverRepository, request);
    return this.calendarRepository.findEvents(driver.id, query);
  }
}
