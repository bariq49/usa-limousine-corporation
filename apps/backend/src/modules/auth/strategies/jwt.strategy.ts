import { ExtractJwt, Strategy } from "passport-jwt";
import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { RolesService } from "../../roles/services/roles.service";
import { SessionsService } from "../../sessions/services/sessions.service";
import { UsersService } from "../../users/users.service";
import type { AccessTokenPayload } from "../types/access-token";
import { ensureAccessSession } from "../utils/ensure-access-session";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(
    @Inject(ConfigService) configService: ConfigService,
    @Inject(RolesService) private readonly rolesService: RolesService,
    @Inject(SessionsService) private readonly sessionsService: SessionsService,
    @Inject(UsersService) private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>("JWT_ACCESS_SECRET"),
    });
  }

  async validate(payload: AccessTokenPayload) {
    await ensureAccessSession({
      userId: payload.sub,
      sessionId: payload.sid,
      sessionsService: this.sessionsService,
      usersService: this.usersService,
    });

    const roles = await this.rolesService.getRoleKeysByUserId({ userId: payload.sub });
    return {
      sub: payload.sub,
      sid: payload.sid,
      email: payload.email,
      roles,
    };
  }
}
