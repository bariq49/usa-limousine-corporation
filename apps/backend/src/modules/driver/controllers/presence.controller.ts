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
import { BeatDto, HistoryQueryDto, UpdateDto } from "../dto/presence.dto";
import { DriverPresenceService } from "../services/presence.service";

@Controller("drivers")
@UseGuards(JwtAuthGuard, RolesGuard)
export class DriverPresenceController {
  constructor(
    @Inject(DriverPresenceService) private readonly presenceService: DriverPresenceService,
  ) {}

  @Get("fleet/online")
  @Roles(RoleKey.SUPER_ADMIN)
  listFleetOnline() {
    return this.presenceService.listFleetOnline();
  }

  @Get("presence")
  @Roles(RoleKey.DRIVER)
  getPresence(@Req() request: Request) {
    return this.presenceService.getPresence(request);
  }

  @Patch("presence")
  @Roles(RoleKey.DRIVER)
  updatePresence(@Body() body: UpdateDto, @Req() request: Request) {
    return this.presenceService.updatePresence(body, request);
  }

  @Post("presence/heartbeat")
  @Roles(RoleKey.DRIVER)
  heartbeatPresence(@Body() body: BeatDto, @Req() request: Request) {
    return this.presenceService.heartbeatPresence(body, request);
  }

  @Get("presence/history")
  @Roles(RoleKey.DRIVER)
  listPresenceHistory(@Query() query: HistoryQueryDto, @Req() request: Request) {
    return this.presenceService.listPresenceHistory(query, request);
  }

  @Delete("presence/history/:sessionId")
  @Roles(RoleKey.DRIVER)
  removePresenceHistory(@Param("sessionId") sessionId: string, @Req() request: Request) {
    return this.presenceService.removePresenceHistory(sessionId, request);
  }

  @Delete("presence/history")
  @Roles(RoleKey.DRIVER)
  clearPresenceHistory(@Req() request: Request) {
    return this.presenceService.clearPresenceHistory(request);
  }
}
