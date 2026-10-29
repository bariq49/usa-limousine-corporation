import { Body, Controller, Delete, Get, Inject, Param, Post, Req, UseGuards } from "@nestjs/common";
import { RoleKey } from "@prisma/client";
import type { Request } from "express";
import { Roles } from "../../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { AssignDto } from "../dto/driver.dto";
import { AssignmentService } from "../services/assignment.service";

@Controller("admin/bookings/:bookingId/assignments")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleKey.SUPER_ADMIN)
export class AssignmentController {
  constructor(@Inject(AssignmentService) private readonly assignments: AssignmentService) {}

  @Get()
  list(@Param("bookingId") bookingId: string) {
    return this.assignments.list(bookingId);
  }

  @Post()
  assign(@Param("bookingId") bookingId: string, @Body() body: AssignDto, @Req() request: Request) {
    return this.assignments.assign(bookingId, body, request);
  }

  @Delete()
  unassign(@Param("bookingId") bookingId: string, @Req() request: Request) {
    return this.assignments.unassign(bookingId, request);
  }
}
