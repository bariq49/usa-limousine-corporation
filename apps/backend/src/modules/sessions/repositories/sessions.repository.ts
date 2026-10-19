import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import type {
  Create,
  GetById,
  ListByUser,
  RevokeAll,
  RevokeCurrent,
  RotateRefreshToken,
} from "../types/session";

@Injectable()
export class SessionsRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  create(params: Create) {
    const { userId, deviceId, refreshTokenHash, expiresAt, ipAddress, userAgent } = params;

    return this.prisma.session.create({
      data: {
        userId,
        deviceId,
        refreshTokenHash,
        expiresAt,
        ipAddress,
        userAgent,
      },
    });
  }

  getById(params: GetById) {
    const { id } = params;
    return this.prisma.session.findUnique({ where: { id } });
  }

  listByUser(params: ListByUser) {
    const { userId } = params;
    return this.prisma.session.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        deviceId: true,
        ipAddress: true,
        userAgent: true,
        expiresAt: true,
        revokedAt: true,
        lastSeenAt: true,
        createdAt: true,
      },
    });
  }

  rotateRefreshToken(params: RotateRefreshToken) {
    const { sessionId, currentTokenHash, tokenHash, expiresAt } = params;
    return this.prisma.session.updateMany({
      where: {
        id: sessionId,
        refreshTokenHash: currentTokenHash,
        revokedAt: null,
      },
      data: {
        refreshTokenHash: tokenHash,
        expiresAt,
        lastSeenAt: new Date(),
      },
    });
  }

  revokeCurrent(params: RevokeCurrent) {
    const { sessionId } = params;
    return this.prisma.session.update({
      where: { id: sessionId },
      data: { revokedAt: new Date(), refreshTokenHash: null },
    });
  }

  revokeAll(params: RevokeAll) {
    const { userId } = params;
    return this.prisma.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date(), refreshTokenHash: null },
    });
  }

  revokeOthers(params: { userId: string; exceptSessionId: string }) {
    const { userId, exceptSessionId } = params;
    return this.prisma.session.updateMany({
      where: { userId, revokedAt: null, id: { not: exceptSessionId } },
      data: { revokedAt: new Date(), refreshTokenHash: null },
    });
  }

  delete(params: { id: string }) {
    const { id } = params;
    return this.prisma.session.delete({ where: { id } });
  }
}
