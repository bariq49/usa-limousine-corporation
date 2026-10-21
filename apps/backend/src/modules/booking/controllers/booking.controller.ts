import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { RoleKey } from "@prisma/client";
import type { Request } from "express";
import { Roles } from "../../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { BulkDeleteDto } from "../../vehicle-categories/dto/bulk-delete.dto";
import { CancelDto, CreateDto, QueryDto, UpdateDto } from "../dto/booking.dto";
import { BookingService } from "../services/booking.service";

@Controller("admin/bookings")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleKey.SUPER_ADMIN)
export class BookingController {
  constructor(@Inject(BookingService) private readonly bookingService: BookingService) {}

  @Post()
  create(@Body() body: CreateDto, @Req() request: Request) {
    return this.bookingService.createManual(body, request);
  }

  @Get()
  list(@Query() query: QueryDto) {
    return this.bookingService.list(query);
  }

  @Get(":id")
  getOne(@Param("id") id: string) {
    return this.bookingService.getOne(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: UpdateDto, @Req() request: Request) {
    return this.bookingService.update(id, body, request);
  }

  @Post(":id/confirm")
  confirm(@Param("id") id: string, @Req() request: Request) {
    return this.bookingService.confirm(id, request);
  }

  @Post(":id/complete")
  complete(@Param("id") id: string, @Req() request: Request) {
    return this.bookingService.complete(id, request);
  }

  @Post(":id/cancel")
  cancel(@Param("id") id: string, @Body() body: CancelDto, @Req() request: Request) {
    return this.bookingService.cancel(id, body, request);
  }

  @Delete("bulk")
  bulkRemove(@Body() body: BulkDeleteDto, @Req() request: Request) {
    return this.bookingService.bulkRemove(body.ids, request);
  }

  @Delete(":id")
  remove(@Param("id") id: string, @Req() request: Request) {
    return this.bookingService.remove(id, request);
  }
}
