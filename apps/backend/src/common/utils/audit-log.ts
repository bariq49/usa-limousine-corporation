import type { AuditLogData, AuditLogParams } from "../types/audit-log.types";
import type { Prisma } from "@prisma/client";

export async function auditLog(params: AuditLogParams): Promise<void> {
  const { prisma, event, result, metadata, sessionId, context } = params;
  const userId = params.userId ?? context?.userId;
  const ipAddress = context?.ipAddress;
  const userAgent = context?.userAgent;

  const auditMetadata: Record<string, Prisma.InputJsonValue> = {
    result,
  };

  if (sessionId) {
    auditMetadata["sessionId"] = sessionId;
  }

  if (
    metadata !== undefined &&
    metadata !== null &&
    typeof metadata === "object" &&
    !Array.isArray(metadata)
  ) {
    for (const [key, value] of Object.entries(metadata)) {
      auditMetadata[key] = value as Prisma.InputJsonValue;
    }
  } else if (metadata !== undefined) {
    auditMetadata["details"] = metadata;
  }

  const data: AuditLogData = {
    event,
    metadata: auditMetadata,
  };

  if (userId) {
    data.userId = userId;
  }
  if (ipAddress) {
    data.ipAddress = ipAddress;
  }
  if (userAgent) {
    data.userAgent = userAgent;
  }

  await prisma.auditLog.create({ data });
}
