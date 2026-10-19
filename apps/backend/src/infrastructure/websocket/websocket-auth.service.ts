import { Inject, Injectable, forwardRef } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import type { Socket } from "socket.io";
import { ensureAccessSession } from "../../modules/auth/utils/ensure-access-session";
import { SessionsService } from "../../modules/sessions/services/sessions.service";
import { UsersService } from "../../modules/users/users.service";
import type { WebsocketIdentity } from "./types/websocket.types";

@Injectable()
export class WebsocketAuthService {
  private readonly accessSecret: string;

  constructor(
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(ConfigService) configService: ConfigService,
    @Inject(forwardRef(() => SessionsService)) private readonly sessionsService: SessionsService,
    @Inject(UsersService) private readonly usersService: UsersService,
  ) {
    this.accessSecret = configService.getOrThrow<string>("JWT_ACCESS_SECRET");
  }

  async authenticate(client: Socket): Promise<WebsocketIdentity | null> {
    const authToken = client.handshake.auth["token"];
    const bearer = client.handshake.headers["authorization"];
    const token =
      typeof authToken === "string" && authToken.trim()
        ? authToken.trim()
        : typeof bearer === "string"
          ? bearer.replace(/^Bearer\s+/i, "").trim() || null
          : null;

    if (!token) {
      return null;
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: this.accessSecret,
      });

      await ensureAccessSession({
        userId: payload.sub,
        sessionId: payload.sid,
        sessionsService: this.sessionsService,
        usersService: this.usersService,
      });

      const expiresAt =
        typeof payload.exp === "number" && Number.isFinite(payload.exp)
          ? payload.exp
          : Math.floor(Date.now() / 1000) + 60;

      const identity: WebsocketIdentity = {
        userId: payload.sub,
        sessionId: payload.sid,
        expiresAt,
      };

      client.data.user = identity;
      return identity;
    } catch {
      return null;
    }
  }

  async ensureStillValid(identity: WebsocketIdentity) {
    if (identity.expiresAt * 1000 <= Date.now()) {
      return false;
    }

    try {
      await ensureAccessSession({
        userId: identity.userId,
        sessionId: identity.sessionId,
        sessionsService: this.sessionsService,
        usersService: this.usersService,
      });
      return true;
    } catch {
      return false;
    }
  }
}
