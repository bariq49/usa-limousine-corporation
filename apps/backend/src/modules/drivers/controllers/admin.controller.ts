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
import {
  CreateDto,
  DriverBookingsQueryDto,
  QueryDto,
  StatsQueryDto,
  UpdateDto,
} from "../dto/driver.dto";
import { DriverService } from "../services/driver.service";

@Controller("admin/drivers")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleKey.SUPER_ADMIN)
export class AdminDriverController {
  constructor(@Inject(DriverService) private readonly drivers: DriverService) {}

  @Get()
  list(@Query() query: QueryDto) {
    return this.drivers.list(query);
  }

  @Get(":id")
  getOne(@Param("id") id: string) {
    return this.drivers.getOne(id);
  }

  @Get(":id/stats")
  stats(@Param("id") id: string, @Query() query: StatsQueryDto) {
    return this.drivers.stats(id, query);
  }

  @Get(":id/bookings")
  bookings(@Param("id") id: string, @Query() query: DriverBookingsQueryDto) {
    return this.drivers.bookings(id, query);
  }

  @Post()
  create(@Body() body: CreateDto, @Req() request: Request) {
    return this.drivers.create(body, request);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: UpdateDto, @Req() request: Request) {
    return this.drivers.update(id, body, request);
  }

  @Delete(":id")
  remove(@Param("id") id: string, @Req() request: Request) {
    return this.drivers.remove(id, request);
  }
}
