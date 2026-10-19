import { Inject, Injectable } from "@nestjs/common";
import { ConversationStatus, Prisma, type ConversationSubjectType } from "@prisma/client";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import type { ListForUser, OpenSubject, UpdateParticipantRead } from "../types/chat";

function decodeConversationCursor(cursor: string): { updatedAt: Date; id: string } | null {
  const separator = cursor.lastIndexOf("|");
  if (separator <= 0) {
    return null;
  }
  const updatedAt = new Date(cursor.slice(0, separator));
  const id = cursor.slice(separator + 1);
  if (Number.isNaN(updatedAt.getTime()) || !id) {
    return null;
  }
  return { updatedAt, id };
}

export function encodeConversationCursor(row: { updatedAt: Date; id: string }): string {
  return `${row.updatedAt.toISOString()}|${row.id}`;
}

@Injectable()
export class ConversationRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.conversation.findUnique({
      where: { id },
      include: {
        participants: true,
      },
    });
  }

  findBySubject(subjectType: ConversationSubjectType, subjectId: string) {
    return this.prisma.conversation.findUnique({
      where: {
        subjectType_subjectId: { subjectType, subjectId },
      },
      include: {
        participants: true,
      },
    });
  }

  findParticipant(conversationId: string, userId: string) {
    return this.prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: { conversationId, userId },
      },
    });
  }

  findParticipantsForUser(userId: string, conversationIds: string[]) {
    if (conversationIds.length === 0) {
      return Promise.resolve([]);
    }
    return this.prisma.conversationParticipant.findMany({
      where: {
        userId,
        conversationId: { in: conversationIds },
        leftAt: null,
      },
    });
  }

  async openForSubject(props: OpenSubject) {
    const existing = await this.findBySubject(props.subjectType, props.subjectId);
    if (existing) {
      if (existing.status === ConversationStatus.ACTIVE) {
        return existing;
      }

      const missingUserIds = props.participantUserIds.filter(
        (userId) => !existing.participants.some((participant) => participant.userId === userId),
      );

      return this.prisma.conversation.update({
        where: { id: existing.id },
        data: {
          status: ConversationStatus.ACTIVE,
          activatedAt: existing.activatedAt ?? new Date(),
          closedAt: null,
          participants: {
            createMany: {
              data: missingUserIds.map((userId) => ({ userId })),
              skipDuplicates: true,
            },
          },
        },
        include: { participants: true },
      });
    }

    try {
      return await this.prisma.conversation.create({
        data: {
          kind: props.kind,
          subjectType: props.subjectType,
          subjectId: props.subjectId,
          status: ConversationStatus.ACTIVE,
          activatedAt: new Date(),
          participants: {
            create: props.participantUserIds.map((userId) => ({ userId })),
          },
        },
        include: { participants: true },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        const raced = await this.findBySubject(props.subjectType, props.subjectId);
        if (raced) {
          return raced;
        }
      }
      throw error;
    }
  }

  deleteBySubject(subjectType: ConversationSubjectType, subjectId: string) {
    return this.prisma.conversation.deleteMany({
      where: { subjectType, subjectId },
    });
  }

  async listForUser(props: ListForUser) {
    const where: Prisma.ConversationWhereInput = {
      participants: { some: { userId: props.userId, leftAt: null } },
      status: ConversationStatus.ACTIVE,
    };

    if (props.cursor) {
      const decoded = decodeConversationCursor(props.cursor);
      if (!decoded) {
        return [];
      }
      where.AND = [
        {
          OR: [
            { updatedAt: { lt: decoded.updatedAt } },
            { updatedAt: decoded.updatedAt, id: { lt: decoded.id } },
          ],
        },
      ];
    }

    return this.prisma.conversation.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
      take: props.limit + 1,
      include: { participants: true },
    });
  }

  updateParticipantRead(props: UpdateParticipantRead) {
    return this.prisma.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId: props.conversationId,
          userId: props.userId,
        },
      },
      data: {
        lastReadMessageId: props.messageId,
        lastReadAt: props.readAt,
      },
    });
  }

  touchUpdatedAt(conversationId: string) {
    return this.prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });
  }
}
