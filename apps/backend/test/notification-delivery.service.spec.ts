import { NotificationRecipientType, NotificationType } from "@prisma/client";
import { Test } from "@nestjs/testing";
import type { TestingModule } from "@nestjs/testing";
import { NotificationQueueService } from "../src/modules/notification/jobs/notification-queue.service";
import { NotificationRepository } from "../src/modules/notification/repositories/notification.repository";
import { NotificationDeliveryService } from "../src/modules/notification/services/notification-delivery.service";
import { TokenResolverRegistry } from "../src/modules/notification/services/push-token-resolver.registry";
import { NotificationRealtimeService } from "../src/modules/notification/websocket/notification-realtime.service";
import type { TokenResolver } from "../src/modules/notification/types/push-token-resolver";
import { RecipientType } from "../src/modules/notification/types/notification";

const customerNotification = {
  id: "n1",
  recipientType: NotificationRecipientType.USER,
  recipientId: "user-1",
  type: NotificationType.BOOKING_CREATED,
  title: "Trip completed",
  body: "Your trip is complete",
  data: { type: "TRIP_COMPLETED" },
  push: true,
  readAt: null,
  deliveredAt: null,
  createdAt: new Date(),
};

const silentNotification = {
  id: "n2",
  recipientType: NotificationRecipientType.USER,
  recipientId: "user-1",
  type: NotificationType.BOOKING_CREATED,
  title: "New booking",
  body: "Booking BK-1 was created.",
  data: null,
  push: false,
  readAt: null,
  deliveredAt: null,
  createdAt: new Date(),
};

function customerResolver(tokens: string[]): TokenResolver {
  return {
    recipientType: RecipientType.USER,
    resolveToken: jest.fn(async () => tokens),
    resolveTokens: jest.fn(async (ids: string[]) => {
      const map = new Map<string, string[]>();
      if (tokens.length > 0) {
        for (const id of ids) {
          map.set(id, tokens);
        }
      }
      return map;
    }),
    invalidateTokens: jest.fn(async () => 0),
  };
}

describe("NotificationDeliveryService", () => {
  const markDelivered = jest.fn(async () => ({ count: 1 }));

  beforeEach(() => {
    markDelivered.mockClear();
  });

  it("enqueues FCM when a resolver returns tokens", async () => {
    const enqueuePush = jest.fn(async () => undefined);
    const emitCreated = jest.fn();
    const registry = new TokenResolverRegistry();
    const resolver = customerResolver(["tok-a", "tok-b"]);
    registry.register(resolver);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationDeliveryService,
        { provide: NotificationRealtimeService, useValue: { emitCreated } },
        { provide: NotificationQueueService, useValue: { enqueuePush } },
        { provide: TokenResolverRegistry, useValue: registry },
        { provide: NotificationRepository, useValue: { markDelivered } },
      ],
    }).compile();

    const service = module.get(NotificationDeliveryService);
    await service.deliver({ notification: customerNotification as never });

    expect(resolver.resolveToken).toHaveBeenCalledWith("user-1");
    expect(markDelivered).toHaveBeenCalledWith(["n1"]);
    expect(enqueuePush).toHaveBeenCalledWith(
      expect.objectContaining({
        tokens: ["tok-a", "tok-b"],
        title: "Trip completed",
      }),
    );
  });

  it("skips FCM when resolver returns empty (e.g. push disabled)", async () => {
    const enqueuePush = jest.fn(async () => undefined);
    const emitCreated = jest.fn();
    const registry = new TokenResolverRegistry();
    registry.register(customerResolver([]));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationDeliveryService,
        { provide: NotificationRealtimeService, useValue: { emitCreated } },
        { provide: NotificationQueueService, useValue: { enqueuePush } },
        { provide: TokenResolverRegistry, useValue: registry },
        { provide: NotificationRepository, useValue: { markDelivered } },
      ],
    }).compile();

    const service = module.get(NotificationDeliveryService);
    await service.deliver({ notification: customerNotification as never });

    expect(emitCreated).toHaveBeenCalled();
    expect(enqueuePush).not.toHaveBeenCalled();
  });

  it("flattens FCM data generically without domain field allow-lists", async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationDeliveryService,
        { provide: NotificationRealtimeService, useValue: { emitCreated: jest.fn() } },
        { provide: NotificationQueueService, useValue: { enqueuePush: jest.fn() } },
        { provide: TokenResolverRegistry, useValue: new TokenResolverRegistry() },
        { provide: NotificationRepository, useValue: { markDelivered: jest.fn() } },
      ],
    }).compile();

    const service = module.get(NotificationDeliveryService);
    const data = service.toFcmData({
      type: "CHAT_MESSAGE",
      title: "New message",
      body: "Hi",
      id: "n1",
      data: {
        type: "CHAT_MESSAGE",
        conversationId: "c1",
        customFlag: true,
        count: 2,
        payload: { tripId: "t1", nested: { a: 1 } },
      },
    });

    expect(data).toEqual(
      expect.objectContaining({
        type: "CHAT_MESSAGE",
        title: "New message",
        body: "Hi",
        notificationId: "n1",
        conversationId: "c1",
        customFlag: "true",
        count: "2",
        tripId: "t1",
        nested: JSON.stringify({ a: 1 }),
      }),
    );
    expect(data["payload"]).toContain("conversationId");
  });

  it("skips FCM entirely when the stored push flag is false (inbox WS still emitted)", async () => {
    const enqueuePush = jest.fn(async () => undefined);
    const emitCreated = jest.fn();
    const registry = new TokenResolverRegistry();
    const resolver = customerResolver(["tok-customer"]);
    registry.register(resolver);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationDeliveryService,
        { provide: NotificationRealtimeService, useValue: { emitCreated } },
        { provide: NotificationQueueService, useValue: { enqueuePush } },
        { provide: TokenResolverRegistry, useValue: registry },
        { provide: NotificationRepository, useValue: { markDelivered } },
      ],
    }).compile();

    const service = module.get(NotificationDeliveryService);
    await service.deliver({ notification: silentNotification as never });

    expect(emitCreated).toHaveBeenCalled();
    expect(resolver.resolveToken).not.toHaveBeenCalled();
    expect(enqueuePush).not.toHaveBeenCalled();
    expect(markDelivered).toHaveBeenCalledWith(["n2"]);
  });

  it("deliverMany emits every row, pushes only push rows, and marks all delivered", async () => {
    const enqueuePush = jest.fn(async () => undefined);
    const emitCreated = jest.fn();
    const registry = new TokenResolverRegistry();
    const resolver = customerResolver(["tok-customer"]);
    registry.register(resolver);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationDeliveryService,
        { provide: NotificationRealtimeService, useValue: { emitCreated } },
        { provide: NotificationQueueService, useValue: { enqueuePush } },
        { provide: TokenResolverRegistry, useValue: registry },
        { provide: NotificationRepository, useValue: { markDelivered } },
      ],
    }).compile();

    const service = module.get(NotificationDeliveryService);
    await service.deliverMany({
      notifications: [customerNotification, silentNotification] as never,
    });

    expect(emitCreated).toHaveBeenCalledTimes(2);
    expect(enqueuePush).toHaveBeenCalledTimes(1);
    expect(markDelivered).toHaveBeenCalledWith(["n1", "n2"]);
  });
});
