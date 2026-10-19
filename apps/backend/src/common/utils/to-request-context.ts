import { UnauthorizedException } from "@nestjs/common";
import type { HttpRequest, RequestContext } from "../types/request-context.types";

export function toRequestContext(request: HttpRequest): RequestContext {
  const context: RequestContext = {};

  if (request.ip) {
    context.ipAddress = request.ip;
  }

  const userAgent = request.headers?.["user-agent"];
  if (typeof userAgent === "string" && userAgent.length > 0) {
    context.userAgent = userAgent;
  }

  const deviceHeader = request.headers?.["x-device-id"];
  if (typeof deviceHeader === "string" && deviceHeader.trim().length > 0) {
    context.deviceId = deviceHeader.trim();
  }

  const userId = request.user?.sub;
  if (typeof userId === "string" && userId.length > 0) {
    context.userId = userId;
  }

  return context;
}

export function requireUserId(context: RequestContext): string {
  if (!context.userId) {
    throw new UnauthorizedException();
  }
  return context.userId;
}
