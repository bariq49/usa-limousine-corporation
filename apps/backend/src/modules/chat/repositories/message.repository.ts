import { Inject, Injectable } from "@nestjs/common";
import { ChatMessageType, type Prisma } from "@prisma/client";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import type {
  CountUnread,
  CreateMessage,
  FindClientMessage,
  ListBefore,
  MarkDelivered,
  MarkReadUpTo,
  UnreadBatch,
} from "../types/chat";

@Injectable()
export class MessageRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.chatMessage.findFirst({
      where: { id, deletedAt: null },
    });
  }

  findLatest(conversationId: string) {
    return this.prisma.chatMessage.findFirst({
      where: { conversationId, deletedAt: null },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });
  }

  findByIds(ids: string[]) {
    if (ids.length === 0) {
      return Promise.resolve([]);
    }
    return this.prisma.chatMessage.findMany({
      where: { id: { in: ids }, deletedAt: null },
    });
  }

  findByClientMessageId(props: FindClientMessage) {
    return this.prisma.chatMessage.findUnique({
      where: {
        conversationId_senderUserId_clientMessageId: {
          conversationId: props.conversationId,
          senderUserId: props.senderUserId,
          clientMessageId: props.clientMessageId,
        },
      },
    });
  }

  async create(props: CreateMessage) {
    return this.prisma.$transaction(async (tx) => {
      const message = await tx.chatMessage.create({
        data: {
          conversationId: props.conversationId,
          senderUserId: props.senderUserId,
          type: ChatMessageType.TEXT,
          body: props.body,
          clientMessageId: props.clientMessageId,
          replyToMessageId: props.replyToMessageId,
          receipts: {
            create: props.recipientUserIds.map((userId) => ({ userId })),
          },
        },
      });

      await tx.conversation.update({
        where: { id: props.conversationId },
        data: { updatedAt: new Date() },
      });

      return message;
    });
  }

  async listBefore(props: ListBefore) {
    const where: Prisma.ChatMessageWhereInput = {
      conversationId: props.conversationId,
      deletedAt: null,
    };

    if (props.after) {
      const after = await this.findById(props.after);
      if (!after || after.conversationId !== props.conversationId) {
        return [];
      }
      where.OR = [
        { createdAt: { gt: after.createdAt } },
        { createdAt: after.createdAt, id: { gt: after.id } },
      ];
      return this.prisma.chatMessage.findMany({
        where,
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        take: props.limit + 1,
      });
    }

    if (props.before) {
      const before = await this.findById(props.before);
      if (!before || before.conversationId !== props.conversationId) {
        return [];
      }
      where.OR = [
        { createdAt: { lt: before.createdAt } },
        { createdAt: before.createdAt, id: { lt: before.id } },
      ];
    }

    return this.prisma.chatMessage.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: props.limit + 1,
    });
  }

  countUnread(props: CountUnread) {
    const where: Prisma.ChatMessageWhereInput = {
      conversationId: props.conversationId,
      deletedAt: null,
      senderUserId: { not: props.userId },
    };

    if (props.afterMessageId && props.afterCreatedAt) {
      where.OR = [
        { createdAt: { gt: props.afterCreatedAt } },
        {
          createdAt: props.afterCreatedAt,
          id: { gt: props.afterMessageId },
        },
      ];
    } else if (props.afterCreatedAt) {
      where.createdAt = { gt: props.afterCreatedAt };
    }

    return this.prisma.chatMessage.count({ where });
  }

  async countUnreadBatch(props: UnreadBatch): Promise<Map<string, number>> {
    const counts = new Map<string, number>();
    for (const conversationId of props.conversationIds) {
      counts.set(conversationId, 0);
    }
    if (props.conversationIds.length === 0) {
      return counts;
    }

    const rows = await this.prisma.chatMessage.findMany({
      where: {
        conversationId: { in: props.conversationIds },
        deletedAt: null,
        senderUserId: { not: props.userId },
      },
      select: {
        id: true,
        conversationId: true,
        createdAt: true,
      },
    });

    const participants = await this.prisma.conversationParticipant.findMany({
      where: {
        userId: props.userId,
        conversationId: { in: props.conversationIds },
      },
      select: {
        conversationId: true,
        lastReadMessageId: true,
        lastReadAt: true,
      },
    });

    const lastReadIds = participants
      .map((participant) => participant.lastReadMessageId)
      .filter((id): id is string => Boolean(id));
    const lastMessages = await this.findByIds(lastReadIds);
    const lastById = new Map(lastMessages.map((message) => [message.id, message]));

    const watermarkByConversation = new Map<
      string,
      { afterMessageId: string | null; afterCreatedAt: Date | null }
    >();
    for (const participant of participants) {
      const last = participant.lastReadMessageId
        ? lastById.get(participant.lastReadMessageId)
        : null;
      watermarkByConversation.set(participant.conversationId, {
        afterMessageId: last?.id ?? null,
        afterCreatedAt: last?.createdAt ?? participant.lastReadAt ?? null,
      });
    }

    for (const row of rows) {
      const watermark = watermarkByConversation.get(row.conversationId);
      if (!watermark?.afterCreatedAt) {
        counts.set(row.conversationId, (counts.get(row.conversationId) ?? 0) + 1);
        continue;
      }
      if (row.createdAt > watermark.afterCreatedAt) {
        counts.set(row.conversationId, (counts.get(row.conversationId) ?? 0) + 1);
        continue;
      }
      if (
        watermark.afterMessageId &&
        row.createdAt.getTime() === watermark.afterCreatedAt.getTime() &&
        row.id > watermark.afterMessageId
      ) {
        counts.set(row.conversationId, (counts.get(row.conversationId) ?? 0) + 1);
      }
    }

    return counts;
  }

  async markDelivered(props: MarkDelivered) {
    const existing = await this.prisma.chatMessageReceipt.findUnique({
      where: {
        messageId_userId: {
          messageId: props.messageId,
          userId: props.userId,
        },
      },
    });
    if (existing?.deliveredAt) {
      return existing;
    }

    return this.prisma.chatMessageReceipt.upsert({
      where: {
        messageId_userId: {
          messageId: props.messageId,
          userId: props.userId,
        },
      },
      create: {
        messageId: props.messageId,
        userId: props.userId,
        deliveredAt: props.at,
      },
      update: {
        deliveredAt: props.at,
      },
    });
  }

  markReadUpTo(props: MarkReadUpTo) {
    return this.prisma.$transaction(async (tx) => {
      const target = await tx.chatMessage.findFirst({
        where: {
          id: props.messageId,
          conversationId: props.conversationId,
          deletedAt: null,
        },
      });
      if (!target) {
        return null;
      }

      const participant = await tx.conversationParticipant.findUnique({
        where: {
          conversationId_userId: {
            conversationId: props.conversationId,
            userId: props.userId,
          },
        },
      });

      if (participant?.lastReadMessageId) {
        const current = await tx.chatMessage.findFirst({
          where: { id: participant.lastReadMessageId, deletedAt: null },
        });
        if (
          current &&
          (current.createdAt > target.createdAt ||
            (current.createdAt.getTime() === target.createdAt.getTime() && current.id >= target.id))
        ) {
          return target;
        }
      }

      const messages = await tx.chatMessage.findMany({
        where: {
          conversationId: props.conversationId,
          deletedAt: null,
          senderUserId: { not: props.userId },
          OR: [
            { createdAt: { lt: target.createdAt } },
            { createdAt: target.createdAt, id: { lte: target.id } },
          ],
        },
        select: { id: true },
      });
      const messageIds = messages.map((message) => message.id);

      if (messageIds.length > 0) {
        const existing = await tx.chatMessageReceipt.findMany({
          where: {
            userId: props.userId,
            messageId: { in: messageIds },
          },
          select: { messageId: true },
        });
        const existingIds = new Set(existing.map((row) => row.messageId));
        const toCreate = messageIds.filter((id) => !existingIds.has(id));

        if (toCreate.length > 0) {
          await tx.chatMessageReceipt.createMany({
            data: toCreate.map((messageId) => ({
              messageId,
              userId: props.userId,
              deliveredAt: props.at,
              readAt: props.at,
            })),
            skipDuplicates: true,
          });
        }

        await tx.chatMessageReceipt.updateMany({
          where: {
            userId: props.userId,
            messageId: { in: messageIds },
            readAt: null,
          },
          data: { readAt: props.at },
        });

        await tx.chatMessageReceipt.updateMany({
          where: {
            userId: props.userId,
            messageId: { in: messageIds },
            deliveredAt: null,
          },
          data: { deliveredAt: props.at },
        });
      }

      await tx.conversationParticipant.update({
        where: {
          conversationId_userId: {
            conversationId: props.conversationId,
            userId: props.userId,
          },
        },
        data: {
          lastReadMessageId: target.id,
          lastReadAt: props.at,
        },
      });

      return target;
    });
  }
}
