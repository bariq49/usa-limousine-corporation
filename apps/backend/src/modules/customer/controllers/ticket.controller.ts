import { Body, Controller, Get, Inject, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { RoleKey } from "@prisma/client";
import type { Request } from "express";
import { Roles } from "../../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { CreateDto, QueryDto, ReplyDto } from "../../help-center/dto/ticket.dto";
import { CustomerTicketService } from "../services/ticket.service";

@Controller("customers/tickets")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleKey.CUSTOMER)
export class CustomerTicketController {
  constructor(@Inject(CustomerTicketService) private readonly tickets: CustomerTicketService) {}

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

  @Post(":id/messages")
  reply(@Param("id") id: string, @Body() body: ReplyDto, @Req() request: Request) {
    return this.tickets.reply(id, body, request);
  }
}
