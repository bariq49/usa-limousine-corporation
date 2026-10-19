import { Body, Controller, Get, Inject, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { RoleKey } from "@prisma/client";
import type { Request } from "express";
import { Roles } from "../../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { CreateDto, QueryDto } from "../../help-center/dto/ticket.dto";
import { DriverTicketService } from "../services/ticket.service";

@Controller("drivers/tickets")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleKey.DRIVER)
export class DriverTicketController {
  constructor(@Inject(DriverTicketService) private readonly tickets: DriverTicketService) {}

  @Post()
  create(@Body() body: CreateDto, @Req() request: Request) {
    return this.tickets.create(body, request);
  }

  @Get()
  list(@Query() query: QueryDto, @Req() request: Request) {
    return this.tickets.list(query, request);
  }

  @Get(":id")
  getOne(@Param("id") id: string, @Req() request: Request) {
    return this.tickets.getOne(id, request);
  }
}
