import {
  type CallHandler,
  type ExecutionContext,
  Inject,
  Injectable,
  type NestInterceptor,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import { map } from "rxjs";
import { getAppEnv } from "../../../config/env";
import { AUTH_COOKIE_ACTION_KEY, CSRF_COOKIE_ACTION_KEY } from "../constants/auth.constants";
import type { Request } from "express";
import { forAppClient } from "../utils/app-cookie";
import { applyAuthCookie } from "../utils/auth-cookie";
import { applyCsrfCookie } from "../utils/csrf-cookie";

@Injectable()
export class AuthCookieInterceptor implements NestInterceptor {
  constructor(
    @Inject(Reflector) private readonly reflector: Reflector,
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const authAction = this.reflector.get(AUTH_COOKIE_ACTION_KEY, context.getHandler());
    const csrfAction = this.reflector.get(CSRF_COOKIE_ACTION_KEY, context.getHandler());

    if (!authAction && !csrfAction) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => {
        const http = context.switchToHttp();
        const response = http.getResponse();
        const request = http.getRequest<Request>();
        const env = getAppEnv(this.configService);

        if (csrfAction) {
          const csrfToken = (data as { csrfToken?: string } | undefined)?.csrfToken;
          if (typeof csrfToken !== "string" || csrfToken.length === 0) {
            return data;
          }

          applyCsrfCookie({
            response,
            cookie: forAppClient(env.csrfCookie, request),
            token: csrfToken,
          });
          return { csrfToken };
        }

        return applyAuthCookie({
          action: authAction,
          response,
          cookie: forAppClient(env.authCookie, request),
          data,
        });
      }),
    );
  }
}
