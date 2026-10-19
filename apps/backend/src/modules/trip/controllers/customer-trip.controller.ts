import { Body, Controller, Get, Inject, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { RoleKey } from "@prisma/client";
import type { Request } from "express";
import { Roles } from "../../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { CancelDto, ListQueryDto, QueryDto, ReviewDto } from "../dto/trip.dto";
import { CallService } from "../services/call.service";
import { TripService } from "../services/trip.service";

@Controller("customers/trips")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleKey.CUSTOMER)
export class CustomerTripController {
  constructor(
    @Inject(TripService) private readonly trips: TripService,
    @Inject(CallService) private readonly calls: CallService,
  ) {}

  @Get()
  list(@Query() query: QueryDto, @Req() request: Request) {
    return this.trips.listForCustomer(query, request);
  }

  @Get("active")
  listActive(@Query() query: ListQueryDto, @Req() request: Request) {
    return this.trips.listActiveForCustomer(query, request);
  }

  @Get("upcoming")
  listUpcoming(@Query() query: ListQueryDto, @Req() request: Request) {
    return this.trips.listUpcomingForCustomer(query, request);
  }

  @Get("completed")
  listCompleted(@Query() query: ListQueryDto, @Req() request: Request) {
    return this.trips.listCompletedForCustomer(query, request);
  }

  @Get("cancelled")
  listCancelled(@Query() query: ListQueryDto, @Req() request: Request) {
    return this.trips.listCancelledForCustomer(query, request);
  }

  @Get(":id/location")
  getLocation(@Param("id") id: string, @Req() request: Request) {
    return this.trips.getLocationForCustomer(id, request);
  }

  @Get(":id/chat")
  getChat(@Param("id") id: string, @Req() request: Request) {
    return this.trips.getChatForCustomer(id, request);
  }

  @Post(":id/call")
  call(@Param("id") id: string, @Req() request: Request) {
    return this.calls.tokenForCustomer(id, request);
  }

  @Post(":id/cancel")
  cancel(@Param("id") id: string, @Body() body: CancelDto, @Req() request: Request) {
    return this.trips.cancelByCustomer(id, body, request);
  }

  @Post(":id/review")
  review(@Param("id") id: string, @Body() body: ReviewDto, @Req() request: Request) {
    return this.trips.reviewDriver(id, body, request);
  }
}
