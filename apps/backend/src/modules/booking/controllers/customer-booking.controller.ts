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
import { CustomerBookingService } from "../services/customer-booking.service";

@Controller("customers/bookings")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleKey.CUSTOMER)
export class CustomerBookingController {
  constructor(
    @Inject(CustomerBookingService)
    private readonly customerBookingService: CustomerBookingService,
  ) {}

  @Post()
  create(@Body() body: CreateDto, @Req() request: Request) {
    return this.customerBookingService.create(body, request);
  }

  @Get()
  list(@Query() query: QueryDto, @Req() request: Request) {
    return this.customerBookingService.list(query, request);
  }

  @Get("calendar")
  calendar(@Query() query: CalendarQueryDto, @Req() request: Request) {
    return this.customerBookingService.calendar(query, request);
  }

  @Get("analytics")
  analytics(@Query() query: AnalyticsQueryDto, @Req() request: Request) {
    return this.customerBookingService.analytics(query, request);
  }

  @Get(":id")
  getOne(@Param("id") id: string, @Req() request: Request) {
    return this.customerBookingService.getOne(id, request);
  }

  @Post(":id/complete")
  complete(@Param("id") id: string, @Req() request: Request) {
    return this.customerBookingService.complete(id, request);
  }

  @Post(":id/cancel")
  cancel(@Param("id") id: string, @Body() body: CancelDto, @Req() request: Request) {
    return this.customerBookingService.cancel(id, body, request);
  }
}
