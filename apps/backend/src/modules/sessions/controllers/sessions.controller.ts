import { Controller, Delete, Get, Inject, Param, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import type { JwtAuthRequest } from "../../auth/types/request-context";
import { SessionsService } from "../services/sessions.service";

@Controller("sessions")
@UseGuards(JwtAuthGuard)
export class SessionsController {
  constructor(@Inject(SessionsService) private readonly sessionsService: SessionsService) {}

  @Get("me")
  listCurrentUserSessions(@Req() request: JwtAuthRequest) {
    return this.sessionsService.listByUser({ userId: request.user.sub });
  }

  @Delete(":sessionId")
  async revokeOwnedSession(@Param("sessionId") sessionId: string, @Req() request: JwtAuthRequest) {
    await this.sessionsService.revokeOwned({
      userId: request.user.sub,
      sessionId,
      callerSessionId: request.user.sid,
    });
    return { message: "Session removed" };
  }
}
