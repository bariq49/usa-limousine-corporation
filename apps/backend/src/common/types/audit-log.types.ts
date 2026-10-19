import type { Prisma } from "@prisma/client";
import type { PrismaService } from "../../infrastructure/database/prisma.service";
import type { RequestContext } from "./request-context.types";

export type AuditResult = "success" | "failure";

export type AuditLogParams = {
  prisma: PrismaService;
  event: string;
  result: AuditResult;
  context?: RequestContext | undefined;
  userId?: string | undefined;
  sessionId?: string | undefined;
  metadata?: Prisma.InputJsonValue | undefined;
};

export type AuditLogData = {
  event: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata: Prisma.InputJsonValue;
};
