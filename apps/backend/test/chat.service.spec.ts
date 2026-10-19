import { ForbiddenException, NotFoundException } from "@nestjs/common";
import {
  ConversationStatus,
  ConversationSubjectType,
  NotificationType,
  TripStatus,
} from "@prisma/client";
import { ChatService } from "../src/modules/chat/services/chat.service";

describe("ChatService", () => {
  const driverUserId = "user-driver";
  const customerUserId = "user-customer";
  const conversationId = "conv1";
  const tripId = "trip1";

  function build(overrides: Record<string, unknown> = {}) {
    const conversation = {
      id: conversationId,
      kind: "CONTEXT" as const,
      subjectType: ConversationSubjectType.TRIP,
      subjectId: tripId,
      status: ConversationStatus.ACTIVE,
      activatedAt: new Date(),
      closedAt: null,
      updatedAt: new Date(),
      createdAt: new Date(),
      participants: [
        { userId: driverUserId, leftAt: null, lastReadMessageId: null, lastReadAt: null },
        { userId: customerUserId, leftAt: null, lastReadMessageId: null, lastReadAt: null },
      ],
    };

    const conversations = {
      openForSubject: jest.fn(async () => conversation),
      deleteBySubject: jest.fn(async () => ({ count: 1 })),
      findBySubject: jest.fn(async () => conversation),
      findById: jest.fn(async () => conversation),
      findParticipant: jest.fn(async () => conversation.participants[0]),
      listForUser: jest.fn(async () => [conversation]),
      updateParticipantRead: jest.fn(),
      touchUpdatedAt: jest.fn(),
      ...((overrides["conversations"] as object) ?? {}),
    };

    const messageRow = {
      id: "msg1",
      conversationId,
      senderUserId: driverUserId,
      type: "TEXT" as const,
      body: "Hello",
      clientMessageId: "client-1",
      replyToMessageId: null,
      createdAt: new Date(),
    };

    const messages = {
      findById: jest.fn(async () => messageRow),
      findLatest: jest.fn(async () => messageRow),
      findByClientMessageId: jest.fn(async () => null),
      create: jest.fn(async () => messageRow),
      listBefore: jest.fn(async () => [messageRow]),
      countUnread: jest.fn(async () => 0),
      countUnreadBatch: jest.fn(async () => new Map([[conversationId, 0]])),
      markDelivered: jest.fn(async () => ({ deliveredAt: new Date() })),
      markReadUpTo: jest.fn(async () => messageRow),
      ...((overrides["messages"] as object) ?? {}),
    };

    const realtime = {
      joinUsersToConversation: jest.fn(async () => undefined),
      leaveUsersFromConversation: jest.fn(async () => undefined),
      conversationOpened: jest.fn(),
      conversationClosed: jest.fn(),
      messageCreated: jest.fn(),
      messageDelivered: jest.fn(),
      messageRead: jest.fn(),
      typing: jest.fn(),
      listUserIdsInConversation: jest.fn(async () => [] as string[]),
      isUserInConversation: jest.fn(async () => false),
      ...((overrides["realtime"] as object) ?? {}),
    };

    const notifications = {
      notify: jest.fn(async () => ({ id: "n1" })),
      ...((overrides["notifications"] as object) ?? {}),
    };

    const tripPolicy = {
      assertCanSend: jest.fn(async () => undefined),
      resolveParticipantUserIds: jest.fn(async () => [driverUserId, customerUserId]),
      ...((overrides["tripPolicy"] as object) ?? {}),
    };

    const prisma = {
      driver: {
        findFirst: jest.fn(async () => ({ id: "driver1" })),
        findMany: jest.fn(async ({ where }: { where?: { userId?: { in?: string[] } } }) => {
          const ids = where?.userId?.in ?? [];
          if (ids.includes(driverUserId)) {
            return [
              {
                id: "driver1",
                userId: driverUserId,
                firstName: "Ada",
                lastName: "Driver",
                avatarUrl: "https://cdn.example/driver.png",
              },
            ];
          }
          return [{ id: "driver1" }];
        }),
      },
      user: {
        findMany: jest.fn(async ({ where }: { where?: { id?: { in?: string[] } } }) => {
          const ids = where?.id?.in ?? [];
          return ids.map((id) =>
            id === customerUserId
              ? {
                  id: customerUserId,
                  firstName: "Bob",
                  lastName: "Passenger",
                  avatar: "https://cdn.example/customer.png",
                }
              : { id, firstName: null, lastName: null, avatar: null },
          );
        }),
      },
      ...((overrides["prisma"] as object) ?? {}),
    };

    const rateLimit = {
      send: jest.fn(async () => undefined),
      typing: jest.fn(async () => undefined),
      ...((overrides["rateLimit"] as object) ?? {}),
    };

    const service = new ChatService(
      conversations as never,
      messages as never,
      realtime as never,
      notifications as never,
      tripPolicy as never,
      prisma as never,
      rateLimit as never,
    );

    return {
      service,
      conversations,
      messages,
      realtime,
      notifications,
      tripPolicy,
      rateLimit,
      conversation,
    };
  }

  it("opens trip chat only with both participants", async () => {
    const { service, conversations } = build();
    const result = await service.openForTrip({
      tripId,
      driverUserId,
      customerUserId,
    });
    expect(result?.id).toBe(conversationId);
    expect(conversations.openForSubject).toHaveBeenCalledWith(
      expect.objectContaining({
        subjectType: ConversationSubjectType.TRIP,
        subjectId: tripId,
        participantUserIds: [driverUserId, customerUserId],
      }),
    );
  });

  it("skips open when customer userId is missing", async () => {
    const { service, conversations } = build();
    const result = await service.openForTrip({
      tripId,
      driverUserId,
      customerUserId: null,
    });
    expect(result).toBeNull();
    expect(conversations.openForSubject).not.toHaveBeenCalled();
  });

  it("rejects resolve while conversation is PENDING", async () => {
    const { service } = build({
      conversations: {
        findBySubject: jest.fn(async () => ({
          id: conversationId,
          status: ConversationStatus.PENDING,
          participants: [{ userId: driverUserId, leftAt: null }],
        })),
      },
    });
    await expect(
      service.resolveTripConversation({ tripId, userId: driverUserId }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("rejects resolve when conversation missing", async () => {
    const { service } = build({
      conversations: {
        findBySubject: jest.fn(async () => null),
      },
    });
    await expect(
      service.resolveTripConversation({ tripId, userId: driverUserId }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("rejects send for non-participant", async () => {
    const { service } = build({
      conversations: {
        findById: jest.fn(async () => ({
          id: conversationId,
          status: ConversationStatus.ACTIVE,
          subjectType: ConversationSubjectType.TRIP,
          subjectId: tripId,
          participants: [{ userId: driverUserId, leftAt: null }],
        })),
      },
    });
    await expect(
      service.sendForUser({
        conversationId,
        senderUserId: "stranger",
        body: "hi",
        clientMessageId: null,
        replyToMessageId: null,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("rejects send when conversation is READ_ONLY", async () => {
    const { service } = build({
      conversations: {
        findById: jest.fn(async () => ({
          id: conversationId,
          status: ConversationStatus.READ_ONLY,
          subjectType: ConversationSubjectType.TRIP,
          subjectId: tripId,
          participants: [
            { userId: driverUserId, leftAt: null },
            { userId: customerUserId, leftAt: null },
          ],
        })),
      },
    });
    await expect(
      service.sendForUser({
        conversationId,
        senderUserId: driverUserId,
        body: "hi",
        clientMessageId: null,
        replyToMessageId: null,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("notifies offline customer via USER + User.id when driver sends", async () => {
    const { service, messages, realtime, notifications, tripPolicy, rateLimit } = build({
      prisma: {
        driver: {
          findFirst: jest.fn(async () => null),
          findMany: jest.fn(async () => [{ id: "driver1" }]),
        },
      },
    });
    const dto = await service.sendForUser({
      conversationId,
      senderUserId: driverUserId,
      body: "Hello",
      clientMessageId: "client-1",
      replyToMessageId: null,
    });
    expect(dto.body).toBe("Hello");
    expect(rateLimit.send).toHaveBeenCalledWith(driverUserId);
    expect(tripPolicy.assertCanSend).toHaveBeenCalled();
    expect(messages.create).toHaveBeenCalled();
    expect(realtime.messageCreated).toHaveBeenCalled();
    expect(notifications.notify).toHaveBeenCalledWith(
      expect.objectContaining({
        recipientType: "USER",
        recipientId: customerUserId,
        type: NotificationType.CHAT_MESSAGE,
        push: true,
        data: expect.objectContaining({
          type: "CHAT_MESSAGE",
          conversationId,
          subjectType: ConversationSubjectType.TRIP,
          tripId,
        }),
      }),
    );
  });

  it("notifies offline driver via DRIVER + Driver.id when customer sends", async () => {
    const { service, notifications } = build({
      prisma: {
        driver: {
          findFirst: jest.fn(async ({ where }: { where: { userId: string } }) =>
            where.userId === driverUserId ? { id: "driver1" } : null,
          ),
          findMany: jest.fn(async () => [{ id: "driver1" }]),
        },
      },
    });
    await service.sendForUser({
      conversationId,
      senderUserId: customerUserId,
      body: "On my way",
      clientMessageId: null,
      replyToMessageId: null,
    });
    expect(notifications.notify).toHaveBeenCalledWith(
      expect.objectContaining({
        recipientType: "DRIVER",
        recipientId: "driver1",
        type: NotificationType.CHAT_MESSAGE,
        push: true,
      }),
    );
  });

  it("auto delivered+read when peer is in chat room (no FCM)", async () => {
    const { service, notifications, realtime, messages } = build({
      realtime: {
        joinUsersToConversation: jest.fn(async () => undefined),
        leaveUsersFromConversation: jest.fn(async () => undefined),
        conversationOpened: jest.fn(),
        conversationClosed: jest.fn(),
        messageCreated: jest.fn(),
        messageDelivered: jest.fn(),
        messageRead: jest.fn(),
        typing: jest.fn(),
        listUserIdsInConversation: jest.fn(async () => [customerUserId]),
      },
      prisma: {
        driver: {
          findFirst: jest.fn(async () => null),
          findMany: jest.fn(async () => [{ id: "driver1" }]),
        },
      },
    });
    await service.sendForUser({
      conversationId,
      senderUserId: driverUserId,
      body: "Hello",
      clientMessageId: null,
      replyToMessageId: null,
    });
    expect(notifications.notify).not.toHaveBeenCalled();
    expect(messages.markDelivered).toHaveBeenCalled();
    expect(messages.markReadUpTo).toHaveBeenCalled();
    expect(realtime.messageDelivered).toHaveBeenCalled();
    expect(realtime.messageRead).toHaveBeenCalled();
  });

  it("list includes counterpart name and avatar for the peer", async () => {
    const { service } = build();
    const result = await service.list(
      { limit: 20 } as never,
      {
        user: { sub: customerUserId },
      } as never,
    );

    expect(result.data[0]?.counterpart).toEqual({
      userId: driverUserId,
      name: "Ada Driver",
      avatar: "https://cdn.example/driver.png",
    });
  });

  it("getForUser returns passenger profile when viewer is the driver", async () => {
    const { service } = build();
    const result = await service.getForUser(conversationId, driverUserId);
    expect(result.counterpart).toEqual({
      userId: customerUserId,
      name: "Bob Passenger",
      avatar: "https://cdn.example/customer.png",
    });
  });

  it("openConversation marks latest peer messages read", async () => {
    const { service, messages, realtime } = build({
      messages: {
        findById: jest.fn(async () => ({
          id: "msg1",
          conversationId,
          senderUserId: driverUserId,
          type: "TEXT" as const,
          body: "Hello",
          clientMessageId: null,
          replyToMessageId: null,
          createdAt: new Date(),
        })),
        findLatest: jest.fn(async () => ({
          id: "msg1",
          conversationId,
          senderUserId: driverUserId,
          type: "TEXT" as const,
          body: "Hello",
          clientMessageId: null,
          replyToMessageId: null,
          createdAt: new Date(),
        })),
        findByClientMessageId: jest.fn(async () => null),
        create: jest.fn(),
        listBefore: jest.fn(async () => []),
        countUnread: jest.fn(async () => 0),
        countUnreadBatch: jest.fn(async () => new Map()),
        markDelivered: jest.fn(async () => ({ deliveredAt: new Date() })),
        markReadUpTo: jest.fn(async () => ({
          id: "msg1",
          conversationId,
          senderUserId: driverUserId,
          createdAt: new Date(),
        })),
      },
    });
    await service.openConversation(conversationId, customerUserId);
    expect(messages.markReadUpTo).toHaveBeenCalledWith(
      expect.objectContaining({
        conversationId,
        userId: customerUserId,
        messageId: "msg1",
      }),
    );
    expect(realtime.messageRead).toHaveBeenCalled();
  });

  it("returns existing message for duplicate clientMessageId", async () => {
    const existing = {
      id: "msg-existing",
      conversationId,
      senderUserId: driverUserId,
      type: "TEXT" as const,
      body: "Hello",
      clientMessageId: "client-1",
      replyToMessageId: null,
      createdAt: new Date(),
    };
    const { service, messages } = build({
      messages: {
        findByClientMessageId: jest.fn(async () => existing),
        create: jest.fn(),
        findById: jest.fn(async () => existing),
        listBefore: jest.fn(async () => []),
        countUnread: jest.fn(async () => 0),
        countUnreadBatch: jest.fn(async () => new Map()),
        markDelivered: jest.fn(),
        markReadUpTo: jest.fn(async () => existing),
      },
    });
    const dto = await service.sendForUser({
      conversationId,
      senderUserId: driverUserId,
      body: "Hello",
      clientMessageId: "client-1",
      replyToMessageId: null,
    });
    expect(dto.id).toBe("msg-existing");
    expect(messages.create).not.toHaveBeenCalled();
  });

  it("deletes conversation, leaves rooms, and emits closed", async () => {
    const { service, conversations, realtime } = build();
    await service.closeForSubject({
      subjectType: ConversationSubjectType.TRIP,
      subjectId: tripId,
    });
    expect(realtime.leaveUsersFromConversation).toHaveBeenCalledWith(
      expect.objectContaining({ conversationId }),
    );
    expect(conversations.deleteBySubject).toHaveBeenCalled();
    expect(realtime.conversationClosed).toHaveBeenCalled();
  });

  it("rate-limits typing", async () => {
    const { service, rateLimit, realtime } = build();
    await service.typing({
      conversationId,
      userId: driverUserId,
      isTyping: true,
    });
    expect(rateLimit.typing).toHaveBeenCalledWith(driverUserId);
    expect(realtime.typing).toHaveBeenCalled();
  });
});

describe("TripChatPolicy", () => {
  it("allows send only for in-progress trip statuses", async () => {
    const { TripChatPolicy } = await import("../src/modules/chat/policies/trip-chat.policy");
    const prisma = {
      trip: {
        findFirst: jest.fn(async () => ({
          status: TripStatus.STARTED,
          driver: { userId: "user-driver" },
          booking: { userId: "user-customer" },
        })),
      },
    };
    const policy = new TripChatPolicy(prisma as never);
    await expect(
      policy.assertCanSend({
        subjectType: ConversationSubjectType.TRIP,
        subjectId: "trip1",
        userId: "user-driver",
      }),
    ).resolves.toBeUndefined();
  });

  it("rejects send for ACCEPTED trip", async () => {
    const { TripChatPolicy } = await import("../src/modules/chat/policies/trip-chat.policy");
    const prisma = {
      trip: {
        findFirst: jest.fn(async () => ({
          status: TripStatus.ACCEPTED,
          driver: { userId: "user-driver" },
          booking: { userId: "user-customer" },
        })),
      },
    };
    const policy = new TripChatPolicy(prisma as never);
    await expect(
      policy.assertCanSend({
        subjectType: ConversationSubjectType.TRIP,
        subjectId: "trip1",
        userId: "user-driver",
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("rejects send for non-participant", async () => {
    const { TripChatPolicy } = await import("../src/modules/chat/policies/trip-chat.policy");
    const prisma = {
      trip: {
        findFirst: jest.fn(async () => ({
          status: TripStatus.STARTED,
          driver: { userId: "user-driver" },
          booking: { userId: "user-customer" },
        })),
      },
    };
    const policy = new TripChatPolicy(prisma as never);
    await expect(
      policy.assertCanSend({
        subjectType: ConversationSubjectType.TRIP,
        subjectId: "trip1",
        userId: "other",
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
