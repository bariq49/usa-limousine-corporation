import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Request } from "express";
import { getAppEnv } from "../../../config/env";
import { forAppClient } from "../utils/app-cookie";
import { csrfTokensEqual } from "../utils/csrf";

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(@Inject(ConfigService) private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const env = getAppEnv(this.configService);
    const authCookie = forAppClient(env.authCookie, request);
    const csrfCookie = forAppClient(env.csrfCookie, request);
    const refreshCookie = request.cookies?.[authCookie.name];

    if (typeof refreshCookie !== "string" || refreshCookie.length === 0) {
      return true;
    }

    const cookieToken = request.cookies?.[csrfCookie.name];
    const headerToken = this.readHeader(request.headers[csrfCookie.headerName]);

    if (
      typeof cookieToken !== "string" ||
      !headerToken ||
      !csrfTokensEqual(cookieToken, headerToken)
    ) {
      throw new ForbiddenException("CSRF token invalid");
    }

    return true;
  }

  private readHeader(value: string | string[] | undefined): string | null {
    if (typeof value === "string" && value.length > 0) {
      return value;
    }

    if (Array.isArray(value) && typeof value[0] === "string" && value[0].length > 0) {
      return value[0];
    }

    return null;
  }
}
