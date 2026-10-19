import type { Request } from "express";

export type HttpRequest = {
  headers?: Request["headers"] | undefined;
  ip?: string | undefined;
  user?: { sub?: string } | undefined;
};

export type RequestContext = {
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
  deviceId?: string | undefined;
  userId?: string | undefined;
};
