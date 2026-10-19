import { Body, Controller, Get, Inject, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { RoleKey } from "@prisma/client";
import type { Request } from "express";
import { Roles } from "../../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { CancelDto, CreateDto, ListQueryDto, QueryDto, ReviewDto } from "../dto/trip.dto";
import { CallService } from "../services/call.service";
import { TripService } from "../services/trip.service";

@Controller("trips")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleKey.DRIVER)
export class TripController {
  constructor(
    @Inject(TripService) private readonly tripService: TripService,
    @Inject(CallService) private readonly calls: CallService,
  ) {}

  @Post()
  create(@Body() body: CreateDto, @Req() request: Request) {
    return this.tripService.create(body, request);
  }

  @Get()
  list(@Query() query: QueryDto, @Req() request: Request) {
    return this.tripService.list(query, request);
  }

  @Get("active")
  listActive(@Query() query: ListQueryDto, @Req() request: Request) {
    return this.tripService.listActive(query, request);
  }

  @Get("upcoming")
  listUpcoming(@Query() query: ListQueryDto, @Req() request: Request) {
    return this.tripService.listUpcoming(query, request);
  }

  @Get("completed")
  listCompleted(@Query() query: ListQueryDto, @Req() request: Request) {
    return this.tripService.listCompleted(query, request);
  }

  @Get("cancelled")
  listCancelled(@Query() query: ListQueryDto, @Req() request: Request) {
    return this.tripService.listCancelled(query, request);
  }

  @Get(":id")
  getOne(@Param("id") id: string, @Req() request: Request) {
    return this.tripService.getOne(id, request);
  }

  @Get(":id/chat")
  getChat(@Param("id") id: string, @Req() request: Request) {
    return this.tripService.getChatForDriver(id, request);
  }

  @Post(":id/call")
  call(@Param("id") id: string, @Req() request: Request) {
    return this.calls.tokenForDriver(id, request);
  }

  @Post(":id/start")
  start(@Param("id") id: string, @Req() request: Request) {
    return this.tripService.start(id, request);
  }

  @Post(":id/arrived-at-pickup")
  arrivedAtPickup(@Param("id") id: string, @Req() request: Request) {
    return this.tripService.arrivedAtPickup(id, request);
  }

  @Post(":id/passenger-on-board")
  passengerOnBoard(@Param("id") id: string, @Req() request: Request) {
    return this.tripService.passengerOnBoard(id, request);
  }

  @Post(":id/en-route-to-dropoff")
  enRouteToDropoff(@Param("id") id: string, @Req() request: Request) {
    return this.tripService.enRouteToDropoff(id, request);
  }

  @Post(":id/arrived-at-dropoff")
  arrivedAtDropoff(@Param("id") id: string, @Req() request: Request) {
    return this.tripService.arrivedAtDropoff(id, request);
  }

  @Post(":id/complete")
  complete(@Param("id") id: string, @Req() request: Request) {
    return this.tripService.complete(id, request);
  }

  @Post(":id/cancel")
  cancel(@Param("id") id: string, @Body() body: CancelDto, @Req() request: Request) {
    return this.tripService.cancel(id, body, request);
  }

  @Post(":id/no-show")
  noShow(@Param("id") id: string, @Req() request: Request) {
    return this.tripService.noShow(id, request);
  }

  @Post(":id/review")
  review(@Param("id") id: string, @Body() body: ReviewDto, @Req() request: Request) {
    return this.tripService.review(id, body, request);
  }
}
