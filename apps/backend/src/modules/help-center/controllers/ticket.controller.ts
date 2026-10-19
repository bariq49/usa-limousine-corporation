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
import { BulkDeleteDto, PriorityDto, QueryDto, ReplyDto, StatusDto } from "../dto/ticket.dto";
import { TicketService } from "../services/ticket.service";

@Controller("admin/tickets")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleKey.SUPER_ADMIN)
export class TicketController {
  constructor(@Inject(TicketService) private readonly tickets: TicketService) {}

  @Get()
  list(@Query() query: QueryDto) {
    return this.tickets.list(query);
  }

  @Delete("bulk")
  bulkRemove(@Body() body: BulkDeleteDto, @Req() request: Request) {
    return this.tickets.bulkRemove(body.ids, request);
  }

  @Get(":id")
  getOne(@Param("id") id: string) {
    return this.tickets.getOne(id);
  }

  @Patch(":id/status")
  updateStatus(@Param("id") id: string, @Body() body: StatusDto, @Req() request: Request) {
    return this.tickets.updateStatus(id, body, request);
  }

  @Patch(":id/priority")
  updatePriority(@Param("id") id: string, @Body() body: PriorityDto, @Req() request: Request) {
    return this.tickets.updatePriority(id, body, request);
  }

  @Post(":id/messages")
  reply(@Param("id") id: string, @Body() body: ReplyDto, @Req() request: Request) {
    return this.tickets.reply(id, body, request);
  }

  @Delete(":id")
  remove(@Param("id") id: string, @Req() request: Request) {
    return this.tickets.remove(id, request);
  }
}
