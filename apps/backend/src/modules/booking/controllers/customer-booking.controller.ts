import { Body, Controller, Get, Inject, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { RoleKey } from "@prisma/client";
import type { Request } from "express";
import { Roles } from "../../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import {
  AnalyticsQueryDto,
  CalendarQueryDto,
  CancelDto,
  CreateDto,
  QueryDto,
} from "../dto/booking.dto";
import { BookingService } from "../services/booking.service";

@Controller("customers/bookings")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleKey.CUSTOMER)
export class CustomerBookingController {
  constructor(@Inject(BookingService) private readonly bookingService: BookingService) {}

  @Post()
  create(@Body() body: CreateDto, @Req() request: Request) {
    return this.bookingService.create(body, request);
  }

  @Get()
  list(@Query() query: QueryDto, @Req() request: Request) {
    return this.bookingService.listForCustomer(query, request);
  }

  @Get("calendar")
  calendar(@Query() query: CalendarQueryDto, @Req() request: Request) {
    return this.bookingService.calendarForCustomer(query, request);
  }

  @Get("analytics")
  analytics(@Query() query: AnalyticsQueryDto, @Req() request: Request) {
    return this.bookingService.analyticsForCustomer(query, request);
  }

  @Get(":id")
  getOne(@Param("id") id: string, @Req() request: Request) {
    return this.bookingService.getForCustomer(id, request);
  }

  @Post(":id/complete")
  complete(@Param("id") id: string, @Req() request: Request) {
    return this.bookingService.completeForCustomer(id, request);
  }

  @Post(":id/cancel")
  cancel(@Param("id") id: string, @Body() body: CancelDto, @Req() request: Request) {
    return this.bookingService.cancelForCustomer(id, body, request);
  }
}
