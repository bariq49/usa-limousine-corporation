import { UnauthorizedException } from "@nestjs/common";
import type { SessionsService } from "../../sessions/services/sessions.service";
import type { UsersService } from "../../users/users.service";

export type EnsureAccessSession = {
  userId: string;
  sessionId: string;
  sessionsService: SessionsService;
  usersService: UsersService;
};

export async function ensureAccessSession(params: EnsureAccessSession): Promise<void> {
  const { userId, sessionId, sessionsService, usersService } = params;

  const [session, user] = await Promise.all([
    sessionsService.getById({ id: sessionId }),
    usersService.findById({ id: userId }),
  ]);

  if (
    !session ||
    session.userId !== userId ||
    session.revokedAt ||
    session.expiresAt <= new Date() ||
    !user ||
    !user.isActive ||
    !user.isEmailVerified
  ) {
    throw new UnauthorizedException("Session is invalid");
  }
}
