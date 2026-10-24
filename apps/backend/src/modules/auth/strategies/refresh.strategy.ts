import { ExtractJwt, Strategy } from "passport-jwt";
import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import type { Request } from "express";
import { type AuthCookieEnv, getAppEnv } from "../../../config/env";
import { forAppClient } from "../utils/app-cookie";
import type { RefreshTokenPayload } from "../types/refresh-token";

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, "jwt-refresh") {
  private readonly authCookie: AuthCookieEnv;

  constructor(@Inject(ConfigService) configService: ConfigService) {
    const { authCookie } = getAppEnv(configService);
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const token = request.cookies?.[forAppClient(authCookie, request).name];
          return typeof token === "string" && token.length > 0 ? token : null;
        },
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>("JWT_REFRESH_SECRET"),
      passReqToCallback: true,
    });
    this.authCookie = authCookie;
  }

  validate(request: Request, payload: RefreshTokenPayload) {
    const cookieToken = request.cookies?.[forAppClient(this.authCookie, request).name];
    const refreshToken =
      typeof cookieToken === "string" && cookieToken.length > 0
        ? cookieToken
        : request.headers.authorization?.replace(/^Bearer\s+/i, "");

    if (!refreshToken) {
      throw new UnauthorizedException("Refresh token missing");
    }

    return {
      sub: payload.sub,
      sid: payload.sid,
      email: payload.email,
      rm: payload.rm === true,
      refreshToken,
    };
  }
}
