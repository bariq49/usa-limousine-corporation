import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from "@nestjs/common";
import { WebsocketService } from "../../../infrastructure/websocket/websocket.service";
import { SessionsRepository } from "../repositories/sessions.repository";
import type {
  Create,
  GetById,
  ListByUser,
  RevokeAll,
  RevokeCurrent,
  RevokeOwned,
  RotateRefreshToken,
} from "../types/session";

@Injectable()
export class SessionsService {
  constructor(
    @Inject(SessionsRepository) private readonly sessionsRepository: SessionsRepository,
    @Inject(forwardRef(() => WebsocketService))
    private readonly websocketService: WebsocketService,
  ) {}

  create(params: Create) {
    return this.sessionsRepository.create(params);
  }

  getById(params: GetById) {
    return this.sessionsRepository.getById(params);
  }

  listByUser(params: ListByUser) {
    return this.sessionsRepository.listByUser(params);
  }

  async rotateRefreshToken(params: RotateRefreshToken) {
    const result = await this.sessionsRepository.rotateRefreshToken(params);
    return result.count === 1;
  }

  async revokeCurrent(params: RevokeCurrent) {
    await this.sessionsRepository.revokeCurrent(params);
    this.websocketService.disconnectSession(params.sessionId);
  }

  async revokeOwned(params: RevokeOwned) {
    const { userId, sessionId, callerSessionId } = params;
    if (sessionId === callerSessionId) {
      throw new ForbiddenException("You cannot remove your active session");
    }
    const session = await this.sessionsRepository.getById({ id: sessionId });
    if (!session || session.userId !== userId) {
      throw new NotFoundException("Session not found");
    }

    if (session.revokedAt) {
      await this.sessionsRepository.delete({ id: sessionId });
      return;
    }

    await this.revokeCurrent({ sessionId });
  }

  async deleteOwned(params: RevokeOwned) {
    const { userId, sessionId } = params;
    const session = await this.sessionsRepository.getById({ id: sessionId });
    if (!session || session.userId !== userId) {
      throw new NotFoundException("Session not found");
    }

    if (!session.revokedAt) {
      this.websocketService.disconnectSession(sessionId);
    }
    await this.sessionsRepository.delete({ id: sessionId });
  }

  async revokeAll(params: RevokeAll) {
    await this.sessionsRepository.revokeAll(params);
    this.websocketService.disconnectUser(params.userId);
  }

  async revokeOthers(params: { userId: string; exceptSessionId: string }) {
    await this.sessionsRepository.revokeOthers(params);
    await this.websocketService.disconnectOtherSessions(params.userId, params.exceptSessionId);
  }
}
