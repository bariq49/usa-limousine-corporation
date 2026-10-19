import { Body, Controller, Get, Inject, Param, Post, Req, UseGuards } from "@nestjs/common";
import { RoleKey } from "@prisma/client";
import type { Request } from "express";
import { Roles } from "../../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { CreateDto } from "../dto/booking.dto";
import { AcceptDto, CounterDto } from "../dto/offer.dto";
import { BookingService } from "../services/booking.service";
import { OfferService } from "../services/offer.service";

@Controller("customers/bookings")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleKey.CUSTOMER)
export class CustomerBookingController {
  constructor(
    @Inject(BookingService) private readonly bookingService: BookingService,
    @Inject(OfferService) private readonly offerService: OfferService,
  ) {}

  @Post()
  create(@Body() body: CreateDto, @Req() request: Request) {
    return this.bookingService.create(body, request);
  }

  @Get("current")
  getCurrent(@Req() request: Request) {
    return this.offerService.getCurrentForCustomer(request);
  }

  @Post("offers/:offerId/accept")
  accept(@Param("offerId") offerId: string, @Body() body: AcceptDto, @Req() request: Request) {
    return this.offerService.accept(offerId, body, request);
  }

  @Post("offers/:offerId/decline")
  decline(@Param("offerId") offerId: string, @Req() request: Request) {
    return this.offerService.decline(offerId, request);
  }

  @Get(":id")
  getOne(@Param("id") id: string, @Req() request: Request) {
    return this.offerService.getBookingForCustomer(id, request);
  }

  @Get(":id/nearby-drivers")
  listNearbyDrivers(@Param("id") id: string, @Req() request: Request) {
    return this.offerService.listNearbyDrivers(id, request);
  }

  @Get(":id/offers")
  listOffers(@Param("id") id: string, @Req() request: Request) {
    return this.offerService.listForCustomer(id, request);
  }

  @Post(":id/counter")
  counter(@Param("id") id: string, @Body() body: CounterDto, @Req() request: Request) {
    return this.offerService.counter(id, body, request);
  }

  @Post(":id/cancel-seeking")
  cancelSeeking(@Param("id") id: string, @Req() request: Request) {
    return this.offerService.cancelSeeking(id, request);
  }
}
