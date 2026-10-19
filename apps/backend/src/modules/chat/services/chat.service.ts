import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import {
  ConversationKind,
  ConversationStatus,
  ConversationSubjectType,
  NotificationType,
  Prisma,
} from "@prisma/client";
import type { Request } from "express";
import { requireUserId, toRequestContext } from "../../../common/utils/to-request-context";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { NotificationService } from "../../notification/services/notification.service";
import { RecipientType } from "../../notification/types/notification";
import {
  CHAT_HISTORY_DEFAULT_LIMIT,
  CHAT_HISTORY_MAX_LIMIT,
  CHAT_MESSAGE_MAX_LENGTH,
} from "../constants/chat.constants";
import type { QueryDto, SendDto } from "../dto/chat.dto";
import { TripChatPolicy } from "../policies/trip-chat.policy";
import {
  ConversationRepository,
  encodeConversationCursor,
} from "../repositories/conversation.repository";
import { MessageRepository } from "../repositories/message.repository";
import type {
  Close,
  Conversation,
  ConversationRecord,
  Counterpart,
  Delivered,
  Message,
  MessageRecord,
  Open,
  OpenTrip,
  Read,
  ResolveTrip,
  Send,
  Typing,
} from "../types/chat";
import { ChatRateLimitService } from "./chat-rate-limit.service";
import { ChatRealtimeService } from "./chat-realtime.service";

function mapMessage(row: MessageRecord): Message {
  return {
    id: row.id,
    conversationId: row.conversationId,
    senderUserId: row.senderUserId,
    type: row.type,
    body: row.body,
    clientMessageId: row.clientMessageId,
    replyToMessageId: row.replyToMessageId,
    createdAt: row.createdAt.toISOString(),
  };
}

function mapConversation(
  row: ConversationRecord,
  unreadCount: number,
  counterpart: Counterpart | null,
): Conversation {
  return {
    id: row.id,
    kind: row.kind,
    subjectType: row.subjectType,
    subjectId: row.subjectId,
    status: row.status,
    activatedAt: row.activatedAt?.toISOString() ?? null,
    closedAt: row.closedAt?.toISOString() ?? null,
    unreadCount,
    counterpart,
    updatedAt: row.updatedAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
  };
}

function displayName(firstName: string | null | undefined, lastName: string | null | undefined) {
  const parts: string[] = [];
  if (firstName) {
    parts.push(firstName);
  }
  if (lastName) {
    parts.push(lastName);
  }
  if (parts.length === 0) {
    return null;
  }
  return parts.join(" ");
}

async function loadCounterparts(
  prisma: PrismaService,
  userIds: string[],
): Promise<Map<string, Counterpart>> {
  const profiles = new Map<string, Counterpart>();
  if (userIds.length === 0) {
    return profiles;
  }

  const [drivers, users] = await Promise.all([
    prisma.driver.findMany({
      where: { userId: { in: userIds }, deletedAt: null },
      select: { userId: true, firstName: true, lastName: true, avatarUrl: true },
    }),
    prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, firstName: true, lastName: true, avatar: true },
    }),
  ]);

  const driverByUser = new Map(drivers.map((d) => [d.userId, d]));
  const userById = new Map(users.map((u) => [u.id, u]));

  for (const userId of userIds) {
    const driver = driverByUser.get(userId);
    if (driver) {
      profiles.set(userId, {
        userId,
        name: displayName(driver.firstName, driver.lastName),
        avatar: driver.avatarUrl,
      });
      continue;
    }
    const user = userById.get(userId);
    profiles.set(userId, {
      userId,
      name: user ? displayName(user.firstName, user.lastName) : null,
      avatar: user?.avatar ?? null,
    });
  }

  return profiles;
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @Inject(ConversationRepository) private readonly conversations: ConversationRepository,
    @Inject(MessageRepository) private readonly messages: MessageRepository,
    @Inject(ChatRealtimeService) private readonly realtime: ChatRealtimeService,
    @Inject(NotificationService) private readonly notifications: NotificationService,
    @Inject(TripChatPolicy) private readonly tripPolicy: TripChatPolicy,
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(ChatRateLimitService) private readonly rateLimit: ChatRateLimitService,
  ) {}

  async openForSubject(props: Open) {
    const participantUserIds = Array.from(new Set(props.participantUserIds.filter(Boolean)));
    if (participantUserIds.length < 2) {
      this.logger.warn(
        `openForSubject skipped: need ≥2 participants (got ${participantUserIds.length}) subject=${props.subjectType}:${props.subjectId}`,
      );
      return null;
    }

    const conversation = await this.conversations.openForSubject({
      subjectType: props.subjectType,
      subjectId: props.subjectId,
      participantUserIds,
      kind: props.kind ?? ConversationKind.CONTEXT,
    });

    await this.realtime.joinUsersToConversation({
      userIds: participantUserIds,
      conversationId: conversation.id,
    });

    const drivers =
      participantUserIds.length === 0
        ? []
        : await this.prisma.driver.findMany({
            where: { userId: { in: participantUserIds }, deletedAt: null },
            select: { id: true },
          });
    const driverIds = drivers.map((driver) => driver.id);

    this.realtime.conversationOpened({
      userIds: participantUserIds,
      driverIds,
      payload: {
        type: "CHAT_CONVERSATION_OPENED",
        payload: {
          conversationId: conversation.id,
          subjectType: conversation.subjectType,
          subjectId: conversation.subjectId,
          status: conversation.status,
        },
      },
    });

    this.logger.log(
      `conversation opened id=${conversation.id} subject=${props.subjectType}:${props.subjectId}`,
    );
    return conversation;
  }

  async openForTrip(props: OpenTrip) {
    if (!props.customerUserId) {
      this.logger.warn(`openForTrip skipped: no customer userId trip=${props.tripId}`);
      return null;
    }
    return this.openForSubject({
      subjectType: ConversationSubjectType.TRIP,
      subjectId: props.tripId,
      participantUserIds: [props.driverUserId, props.customerUserId],
      kind: ConversationKind.CONTEXT,
    });
  }

  async closeForSubject(props: Close) {
    const existing = await this.conversations.findBySubject(props.subjectType, props.subjectId);
    if (!existing) {
      return null;
    }

    const userIds = existing.participants.map((participant) => participant.userId);
    const drivers =
      userIds.length === 0
        ? []
        : await this.prisma.driver.findMany({
            where: { userId: { in: userIds }, deletedAt: null },
            select: { id: true },
          });
    const driverIds = drivers.map((driver) => driver.id);

    await this.realtime.leaveUsersFromConversation({
      userIds,
      conversationId: existing.id,
    });

    await this.conversations.deleteBySubject(props.subjectType, props.subjectId);

    this.realtime.conversationClosed({
      userIds,
      driverIds,
      payload: {
        type: "CHAT_CONVERSATION_CLOSED",
        payload: {
          conversationId: existing.id,
          subjectType: existing.subjectType,
          subjectId: existing.subjectId,
          deleted: true,
        },
      },
    });

    this.logger.log(
      `conversation deleted id=${existing.id} subject=${props.subjectType}:${props.subjectId}`,
    );
    return null;
  }

  async list(query: QueryDto, request: Request) {
    const userId = requireUserId(toRequestContext(request));
    const limit = Math.min(query.limit ?? 20, 100);
    const rows = await this.conversations.listForUser({
      userId,
      limit,
      cursor: query.cursor ?? null,
    });
    const page = rows.slice(0, limit);
    const nextCursor =
      rows.length > limit && page[page.length - 1]
        ? encodeConversationCursor(page[page.length - 1]!)
        : null;

    const unreadByConversation = await this.messages.countUnreadBatch({
      userId,
      conversationIds: page.map((row) => row.id),
    });

    const peerIds = new Set<string>();
    for (const row of page) {
      const peer = row.participants.find((p) => p.userId !== userId && !p.leftAt);
      if (peer) {
        peerIds.add(peer.userId);
      }
    }
    const profiles = await loadCounterparts(this.prisma, Array.from(peerIds));

    const data: Conversation[] = [];
    for (const row of page) {
      const peer = row.participants.find((p) => p.userId !== userId && !p.leftAt);
      const counterpart = peer
        ? (profiles.get(peer.userId) ?? { userId: peer.userId, name: null, avatar: null })
        : null;
      data.push(mapConversation(row, unreadByConversation.get(row.id) ?? 0, counterpart));
    }

    return { data, nextCursor };
  }

  async getOne(conversationId: string, request: Request): Promise<Conversation> {
    const userId = requireUserId(toRequestContext(request));
    return this.openConversation(conversationId, userId);
  }

  async getForUser(conversationId: string, userId: string): Promise<Conversation> {
    const conversation = await this.conversations.findById(conversationId);
    if (!conversation) {
      throw new NotFoundException("Conversation not found");
    }
    const participant = conversation.participants.find(
      (row) => row.userId === userId && !row.leftAt,
    );
    if (!participant) {
      throw new ForbiddenException("Not a conversation participant");
    }

    const me = await this.conversations.findParticipant(conversationId, userId);
    let afterCreatedAt: Date | null = null;
    let afterMessageId: string | null = null;
    if (me?.lastReadMessageId) {
      const last = await this.messages.findById(me.lastReadMessageId);
      afterMessageId = last?.id ?? null;
      afterCreatedAt = last?.createdAt ?? me.lastReadAt ?? null;
    } else {
      afterCreatedAt = me?.lastReadAt ?? null;
    }
    const unreadCount = await this.messages.countUnread({
      conversationId,
      userId,
      afterMessageId,
      afterCreatedAt,
    });

    const peer = conversation.participants.find((p) => p.userId !== userId && !p.leftAt);
    const profiles = peer
      ? await loadCounterparts(this.prisma, [peer.userId])
      : new Map<string, Counterpart>();
    const counterpart = peer
      ? (profiles.get(peer.userId) ?? { userId: peer.userId, name: null, avatar: null })
      : null;

    return mapConversation(conversation, unreadCount, counterpart);
  }

  async openConversation(conversationId: string, userId: string): Promise<Conversation> {
    const conversation = await this.conversations.findById(conversationId);
    if (!conversation) {
      throw new NotFoundException("Conversation not found");
    }
    const participant = conversation.participants.find(
      (row) => row.userId === userId && !row.leftAt,
    );
    if (!participant) {
      throw new ForbiddenException("Not a conversation participant");
    }

    const latest = await this.messages.findLatest(conversationId);
    if (latest) {
      await this.readForUser({
        conversationId,
        userId,
        messageId: latest.id,
      });
    }

    return this.getForUser(conversationId, userId);
  }

  async acknowledgeOpen(props: { conversationId: string; userId: string }) {
    const conversation = await this.conversations.findById(props.conversationId);
    if (!conversation) {
      throw new NotFoundException("Conversation not found");
    }
    const participant = conversation.participants.find(
      (row) => row.userId === props.userId && !row.leftAt,
    );
    if (!participant) {
      throw new ForbiddenException("Not a conversation participant");
    }

    const latest = await this.messages.findLatest(props.conversationId);
    if (!latest) {
      return { ok: true };
    }

    await this.readForUser({
      conversationId: props.conversationId,
      userId: props.userId,
      messageId: latest.id,
    });
    return { ok: true };
  }

  async listMessages(conversationId: string, query: QueryDto, request: Request) {
    const userId = requireUserId(toRequestContext(request));
    const conversation = await this.conversations.findById(conversationId);
    if (!conversation) {
      throw new NotFoundException("Conversation not found");
    }
    const participant = conversation.participants.find(
      (row) => row.userId === userId && !row.leftAt,
    );
    if (!participant) {
      throw new ForbiddenException("Not a conversation participant");
    }

    if (query.before && query.after) {
      throw new BadRequestException("Use either before or after, not both");
    }

    const limit = Math.min(
      Math.max(query.limit ?? CHAT_HISTORY_DEFAULT_LIMIT, 1),
      CHAT_HISTORY_MAX_LIMIT,
    );
    const rows = await this.messages.listBefore({
      conversationId,
      before: query.before ?? null,
      after: query.after ?? null,
      limit,
    });
    const page = rows.slice(0, limit);
    const hasMore = rows.length > limit;

    if (query.after) {
      const data: Message[] = [];
      for (const row of page) {
        data.push(mapMessage(row));
      }
      return {
        data,
        nextCursor: hasMore ? (page[page.length - 1]?.id ?? null) : null,
      };
    }

    const chronological = page.reverse();
    const data: Message[] = [];
    for (const row of chronological) {
      data.push(mapMessage(row));
    }
    return {
      data,
      nextCursor: hasMore ? (chronological[0]?.id ?? null) : null,
    };
  }

  async send(conversationId: string, body: SendDto, request: Request): Promise<Message> {
    const userId = requireUserId(toRequestContext(request));
    return this.sendForUser({
      conversationId,
      senderUserId: userId,
      body: body.body,
      clientMessageId: body.clientMessageId ?? null,
      replyToMessageId: body.replyToMessageId ?? null,
    });
  }

  async sendForUser(props: Send): Promise<Message> {
    await this.rateLimit.send(props.senderUserId);

    const body = props.body.trim();
    if (!body || body.length > CHAT_MESSAGE_MAX_LENGTH) {
      throw new BadRequestException("Invalid message body");
    }

    const conversation = await this.conversations.findById(props.conversationId);
    if (!conversation) {
      throw new NotFoundException("Conversation not found");
    }
    const participant = conversation.participants.find(
      (row) => row.userId === props.senderUserId && !row.leftAt,
    );
    if (!participant) {
      throw new ForbiddenException("Not a conversation participant");
    }
    if (conversation.status !== ConversationStatus.ACTIVE) {
      throw new ForbiddenException("Conversation is read-only");
    }

    if (conversation.subjectType === ConversationSubjectType.TRIP && conversation.subjectId) {
      await this.tripPolicy.assertCanSend({
        subjectType: conversation.subjectType,
        subjectId: conversation.subjectId,
        userId: props.senderUserId,
      });
    }

    if (props.clientMessageId) {
      const existing = await this.messages.findByClientMessageId({
        conversationId: props.conversationId,
        senderUserId: props.senderUserId,
        clientMessageId: props.clientMessageId,
      });
      if (existing) {
        return mapMessage(existing);
      }
    }

    if (props.replyToMessageId) {
      const reply = await this.messages.findById(props.replyToMessageId);
      if (!reply || reply.conversationId !== props.conversationId) {
        throw new BadRequestException("Invalid replyToMessageId");
      }
    }

    const recipients = conversation.participants
      .filter((row) => row.userId !== props.senderUserId && !row.leftAt)
      .map((row) => row.userId);

    let message;
    try {
      message = await this.messages.create({
        conversationId: props.conversationId,
        senderUserId: props.senderUserId,
        body,
        clientMessageId: props.clientMessageId,
        replyToMessageId: props.replyToMessageId,
        recipientUserIds: recipients,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002" &&
        props.clientMessageId
      ) {
        const existing = await this.messages.findByClientMessageId({
          conversationId: props.conversationId,
          senderUserId: props.senderUserId,
          clientMessageId: props.clientMessageId,
        });
        if (existing) {
          return mapMessage(existing);
        }
      }
      throw error;
    }

    const dto = mapMessage(message);
    this.realtime.messageCreated({
      conversationId: props.conversationId,
      payload: {
        type: "CHAT_MESSAGE",
        payload: dto,
      },
    });

    const onlineUserIds = new Set(
      await this.realtime.listUserIdsInConversation(props.conversationId),
    );
    const offlineRecipients: string[] = [];
    for (const recipientUserId of recipients) {
      if (onlineUserIds.has(recipientUserId)) {
        await this.markDelivered({
          conversationId: props.conversationId,
          userId: recipientUserId,
          messageId: message.id,
        });
        await this.readForUser({
          conversationId: props.conversationId,
          userId: recipientUserId,
          messageId: message.id,
        });
      } else {
        offlineRecipients.push(recipientUserId);
      }
    }

    if (offlineRecipients.length > 0) {
      const tripId =
        conversation.subjectType === ConversationSubjectType.TRIP ? conversation.subjectId : null;
      const data = {
        type: "CHAT_MESSAGE",
        conversationId: props.conversationId,
        messageId: message.id,
        subjectType: conversation.subjectType,
        subjectId: conversation.subjectId,
        tripId,
        payload: {
          conversationId: props.conversationId,
          messageId: message.id,
          subjectType: conversation.subjectType,
          subjectId: conversation.subjectId,
          tripId,
        },
      };
      const preview = body.slice(0, 120);

      for (const recipientUserId of offlineRecipients) {
        const driver = await this.prisma.driver.findFirst({
          where: { userId: recipientUserId, deletedAt: null },
          select: { id: true },
        });

        if (driver) {
          await this.notifications.notify({
            recipientType: RecipientType.DRIVER,
            recipientId: driver.id,
            type: NotificationType.CHAT_MESSAGE,
            title: "New message",
            body: preview,
            data,
            push: true,
          });
          continue;
        }

        await this.notifications.notify({
          recipientType: RecipientType.USER,
          recipientId: recipientUserId,
          type: NotificationType.CHAT_MESSAGE,
          title: "New message",
          body: preview,
          data,
          push: true,
        });
      }
    }

    return dto;
  }

  async markDelivered(props: Delivered) {
    const conversation = await this.conversations.findById(props.conversationId);
    if (!conversation) {
      throw new NotFoundException("Conversation not found");
    }
    const participant = conversation.participants.find(
      (row) => row.userId === props.userId && !row.leftAt,
    );
    if (!participant) {
      throw new ForbiddenException("Not a conversation participant");
    }

    const message = await this.messages.findById(props.messageId);
    if (!message || message.conversationId !== props.conversationId) {
      throw new NotFoundException("Message not found");
    }
    if (message.senderUserId === props.userId) {
      return { ok: true };
    }

    const at = new Date();
    const receipt = await this.messages.markDelivered({
      messageId: props.messageId,
      userId: props.userId,
      at,
    });
    const deliveredAt = receipt.deliveredAt ?? at;
    this.realtime.messageDelivered({
      conversationId: props.conversationId,
      payload: {
        type: "CHAT_MESSAGE_DELIVERED",
        payload: {
          conversationId: props.conversationId,
          messageId: props.messageId,
          userId: props.userId,
          deliveredAt: deliveredAt.toISOString(),
        },
      },
    });
    return { ok: true };
  }

  async readForUser(props: Read) {
    const conversation = await this.conversations.findById(props.conversationId);
    if (!conversation) {
      throw new NotFoundException("Conversation not found");
    }
    const participant = conversation.participants.find(
      (row) => row.userId === props.userId && !row.leftAt,
    );
    if (!participant) {
      throw new ForbiddenException("Not a conversation participant");
    }

    const at = new Date();
    const target = await this.messages.markReadUpTo({
      conversationId: props.conversationId,
      userId: props.userId,
      messageId: props.messageId,
      at,
    });
    if (!target) {
      throw new NotFoundException("Message not found");
    }

    this.realtime.messageRead({
      conversationId: props.conversationId,
      payload: {
        type: "CHAT_MESSAGE_READ",
        payload: {
          conversationId: props.conversationId,
          messageId: props.messageId,
          userId: props.userId,
          readAt: at.toISOString(),
        },
      },
    });
    return { ok: true };
  }

  async typing(props: Typing) {
    await this.rateLimit.typing(props.userId);

    const conversation = await this.conversations.findById(props.conversationId);
    if (!conversation) {
      throw new NotFoundException("Conversation not found");
    }
    const participant = conversation.participants.find(
      (row) => row.userId === props.userId && !row.leftAt,
    );
    if (!participant) {
      throw new ForbiddenException("Not a conversation participant");
    }
    if (conversation.status !== ConversationStatus.ACTIVE) {
      return { ok: true };
    }

    this.realtime.typing({
      conversationId: props.conversationId,
      payload: {
        type: "CHAT_TYPING",
        payload: {
          conversationId: props.conversationId,
          userId: props.userId,
          isTyping: props.isTyping,
        },
      },
    });
    return { ok: true };
  }

  async resolveTripConversation(props: ResolveTrip): Promise<Conversation> {
    const conversation = await this.conversations.findBySubject(
      ConversationSubjectType.TRIP,
      props.tripId,
    );
    if (!conversation) {
      throw new NotFoundException("Chat is not available for this trip yet");
    }
    if (conversation.status === ConversationStatus.PENDING) {
      throw new ForbiddenException("Chat is not open until the driver starts the ride");
    }
    return this.openConversation(conversation.id, props.userId);
  }
}
