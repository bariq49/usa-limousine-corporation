import { Test } from "@nestjs/testing";
import type { TestingModule } from "@nestjs/testing";
import { NotificationRecipientType, NotificationType } from "@prisma/client";
import { AppLogger } from "../src/common/logger/app.logger";
import { notifyUser, stageForAdmins, stageForUser } from "../src/common/utils/notification";
import { NotificationRepository } from "../src/modules/notification/repositories/notification.repository";
import { NotificationService } from "../src/modules/notification/services/notification.service";
import { NotificationRealtimeService } from "../src/modules/notification/websocket/notification-realtime.service";

async function createService(
  repository: object,
  realtime: object = {},
  appLogger: object = {
    error: jest.fn(),
    warn: jest.fn(),
    log: jest.fn(),
    debug: jest.fn(),
  },
) {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      NotificationService,
      { provide: NotificationRepository, useValue: repository },
      { provide: NotificationRealtimeService, useValue: realtime },
      { provide: AppLogger, useValue: appLogger },
    ],
  }).compile();

  return module.get(NotificationService);
}

function row(id: string, recipientId: string) {
  return {
    id,
    recipientType: NotificationRecipientType.USER,
    recipientId,
    type: NotificationType.BOOKING_CREATED,
    title: "New booking",
    body: "Booking BK-1 was created.",
    data: { bookingId: "b1" },
    idempotencyKey: null,
    readAt: null,
    deliveredAt: null,
    deliveryAttempts: 1,
    nextDeliveryAt: new Date(),
    deliveryLockedUntil: null,
    deadLetteredAt: null,
    lastDeliveryError: null,
    createdAt: new Date(),
  };
}

function logger() {
  return { error: jest.fn(), warn: jest.fn(), log: jest.fn(), debug: jest.fn() };
}

describe("NotificationService", () => {
  it("creates a notification and delivers it", async () => {
    const created = row("n1", "u1");
    const create = jest.fn(async () => created);
    const markDelivered = jest.fn(async () => ({ count: 1 }));
    const emitCreated = jest.fn(() => true);
    const service = await createService(
      { create, claimForDelivery: jest.fn(async () => [created]), markDelivered },
      { emitCreated },
    );

    const result = await service.notify({
      recipientType: NotificationRecipientType.USER,
      recipientId: "u1",
      type: NotificationType.BOOKING_CREATED,
      title: "New booking",
      body: "Booking BK-1 was created.",
      data: { bookingId: "b1" },
    });

    expect(create).toHaveBeenCalled();
    expect(emitCreated).toHaveBeenCalledWith(created);
    expect(markDelivered).toHaveBeenCalledWith(["n1"], expect.any(Date));
    expect(result.id).toBe("n1");
  });

  it("returns existing row for duplicate idempotencyKey without re-delivery", async () => {
    const existing = row("n-existing", "u1");
    const findByIdempotencyKey = jest.fn(async () => existing);
    const create = jest.fn();
    const emitCreated = jest.fn(() => true);
    const service = await createService({ findByIdempotencyKey, create }, { emitCreated });

    const result = await service.notify({
      recipientType: NotificationRecipientType.USER,
      recipientId: "u1",
      type: NotificationType.BOOKING_CREATED,
      title: "New booking",
      body: "Booking BK-1 was created.",
      idempotencyKey: "key-1",
    });

    expect(result.id).toBe("n-existing");
    expect(create).not.toHaveBeenCalled();
    expect(emitCreated).not.toHaveBeenCalled();
  });

  it("notifies many recipients in one insert and one deliverMany", async () => {
    const created = [row("n-1", "u1"), row("n-2", "u2")];
    const findByIdempotencyKeys = jest.fn(async () => []);
    const createManyAndReturn = jest.fn(async () => created);
    const markDelivered = jest.fn(async () => ({ count: 2 }));
    const emitCreated = jest.fn(() => true);
    const service = await createService(
      {
        findByIdempotencyKeys,
        createManyAndReturn,
        claimForDelivery: jest.fn(async () => created),
        markDelivered,
      },
      { emitCreated },
    );

    const result = await service.notifyMany([
      {
        recipientType: NotificationRecipientType.USER,
        recipientId: "u1",
        type: NotificationType.BOOKING_CREATED,
        title: "New booking",
        body: "Booking BK-1 was created.",
      },
      {
        recipientType: NotificationRecipientType.USER,
        recipientId: "u2",
        type: NotificationType.BOOKING_CREATED,
        title: "New booking",
        body: "Booking BK-1 was created.",
      },
    ]);

    expect(createManyAndReturn).toHaveBeenCalledTimes(1);
    expect(emitCreated).toHaveBeenCalledTimes(2);
    expect(markDelivered).toHaveBeenCalledWith(["n-1", "n-2"], expect.any(Date));
    expect(result).toHaveLength(2);
  });

  it("stages one row per admin on the caller's transaction with per-admin idempotency keys", async () => {
    const tx = {
      user: {
        findMany: jest.fn(async () => [{ id: "admin-1" }, { id: "admin-2" }]),
      },
    };
    const createManyAndReturn = jest.fn(async () => [row("n-1", "admin-1")]);
    const service = await createService({ createManyAndReturn });

    await stageForAdmins(
      service,
      {
        type: NotificationType.BOOKING_CREATED,
        title: "New booking",
        body: "Booking BK-1 was created.",
        data: { bookingId: "b1" },
        excludeUserId: "customer-user",
        idempotencyKey: "BOOKING_CREATED:b1",
      },
      tx as never,
    );

    expect(tx.user.findMany).toHaveBeenCalledWith({
      where: {
        isActive: true,
        roles: { some: { role: { key: "SUPER_ADMIN" } } },
        id: { not: "customer-user" },
      },
      select: { id: true },
    });
    expect(createManyAndReturn).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          recipientId: "admin-1",
          idempotencyKey: "BOOKING_CREATED:b1:admin-1",
        }),
        expect.objectContaining({
          recipientId: "admin-2",
          idempotencyKey: "BOOKING_CREATED:b1:admin-2",
        }),
      ],
      tx,
    );
  });

  it("stages directly for a user ID without looking up a customer", async () => {
    const tx = { customer: { findUnique: jest.fn() } };
    const createManyAndReturn = jest.fn(async () => [row("n-1", "user-1")]);
    const service = await createService({ createManyAndReturn });

    await stageForUser(
      service,
      {
        userId: "user-1",
        type: NotificationType.BOOKING_CREATED,
        title: "Booking received",
        body: "Your booking was created.",
        idempotencyKey: "BOOKING_CREATED_CUSTOMER:b1",
      },
      tx as never,
    );

    expect(createManyAndReturn).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          recipientId: "user-1",
          idempotencyKey: "BOOKING_CREATED_CUSTOMER:b1",
        }),
      ],
      tx,
    );
    expect(tx.customer.findUnique).not.toHaveBeenCalled();
  });

  it("notifies directly by user ID", async () => {
    const notify = jest.fn();

    await notifyUser({ notify } as never, {
      userId: "user-1",
      type: NotificationType.BOOKING_CREATED,
      title: "Booking received",
      body: "Your booking was created.",
      idempotencyKey: "BOOKING_CREATED_CUSTOMER:b1",
    });

    expect(notify).toHaveBeenCalledWith(
      expect.objectContaining({
        recipientType: NotificationRecipientType.USER,
        recipientId: "user-1",
        idempotencyKey: "BOOKING_CREATED_CUSTOMER:b1",
      }),
    );
  });

  it("delivers staged rows after commit", async () => {
    const markDelivered = jest.fn(async () => ({ count: 1 }));
    const emitCreated = jest.fn(() => true);
    const staged = [row("n-1", "admin-1")];
    const service = await createService(
      { claimForDelivery: jest.fn(async () => staged), markDelivered },
      { emitCreated },
    );

    await service.deliverStaged(staged);

    expect(emitCreated).toHaveBeenCalledWith(staged[0]);
    expect(markDelivered).toHaveBeenCalledWith(["n-1"], expect.any(Date));
  });

  it("logs claim errors without rejecting post-commit delivery", async () => {
    const appLogger = logger();
    const service = await createService(
      { claimForDelivery: jest.fn(async () => Promise.reject(new Error("Database unavailable"))) },
      {},
      appLogger,
    );

    await expect(service.deliverStaged([row("n-1", "admin-1")])).resolves.toBeUndefined();
    expect(appLogger.error).toHaveBeenCalledWith(
      "Notification staged claim failed: Database unavailable",
      undefined,
      NotificationService.name,
    );
  });

  it("keeps notifications pending when realtime delivery is unavailable", async () => {
    const created = row("n1", "u1");
    const startedAt = Date.now();
    const create = jest.fn(async () => created);
    const claimForDelivery = jest.fn(async () => [created]);
    const markDeliveryFailure = jest.fn(async () => ({ count: 1 }));
    const emitCreated = jest.fn(() => false);
    const service = await createService(
      { create, claimForDelivery, markDeliveryFailure },
      { emitCreated },
    );

    await service.notify({
      recipientType: NotificationRecipientType.USER,
      recipientId: "u1",
      type: NotificationType.BOOKING_CREATED,
      title: "New booking",
      body: "Booking BK-1 was created.",
    });

    expect(emitCreated).toHaveBeenCalledWith(created);
    expect(markDeliveryFailure).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "n1",
        error: "Realtime transport unavailable",
        deadLetteredAt: null,
        nextDeliveryAt: expect.any(Date),
      }),
    );
    const [failure] = markDeliveryFailure.mock.calls[0] as unknown as [{ nextDeliveryAt: Date }];
    expect(failure.nextDeliveryAt.getTime()).toBeGreaterThanOrEqual(startedAt + 15_000);
    expect(failure.nextDeliveryAt.getTime()).toBeLessThanOrEqual(startedAt + 16_000);
  });

  it("marks only successfully broadcast notifications as delivered", async () => {
    const notifications = [row("n1", "u1"), row("n2", "u2")];
    const markDelivered = jest.fn(async () => ({ count: 1 }));
    const markDeliveryFailure = jest.fn(async () => ({ count: 1 }));
    const emitCreated = jest.fn().mockReturnValueOnce(true).mockReturnValueOnce(false);
    const service = await createService(
      {
        claimForDelivery: jest.fn(async () => notifications),
        markDelivered,
        markDeliveryFailure,
      },
      { emitCreated },
    );

    await service.deliverStaged(notifications);

    expect(markDelivered).toHaveBeenCalledWith(["n1"], expect.any(Date));
    expect(markDeliveryFailure).toHaveBeenCalledWith(
      expect.objectContaining({ id: "n2", deadLetteredAt: null }),
    );
  });

  it("logs failed broadcasts and marks successful broadcasts from the same batch", async () => {
    const notifications = [row("n1", "u1"), row("n2", "u2")];
    const markDelivered = jest.fn(async () => ({ count: 1 }));
    const markDeliveryFailure = jest.fn(async () => ({ count: 1 }));
    const emitCreated = jest
      .fn()
      .mockImplementationOnce(() => {
        throw new Error("WebSocket broadcast failed");
      })
      .mockReturnValueOnce(true);
    const appLogger = logger();
    const service = await createService(
      {
        claimForDelivery: jest.fn(async () => notifications),
        markDelivered,
        markDeliveryFailure,
      },
      { emitCreated },
      appLogger,
    );

    await service.deliverStaged(notifications);

    expect(appLogger.error).toHaveBeenCalledWith(
      "Notification realtime delivery failed for n1: WebSocket broadcast failed",
      undefined,
      NotificationService.name,
    );
    expect(markDelivered).toHaveBeenCalledWith(["n2"], expect.any(Date));
    expect(markDeliveryFailure).toHaveBeenCalledWith(
      expect.objectContaining({ id: "n1", error: "WebSocket broadcast failed" }),
    );
  });

  it("moves notifications to dead letters after the maximum attempts", async () => {
    const notification = row("n1", "u1");
    notification.deliveryAttempts = 8;
    const markDeliveryFailure = jest.fn(async () => ({ count: 1 }));
    const service = await createService(
      {
        claimForDelivery: jest.fn(async () => [notification]),
        markDeliveryFailure,
      },
      { emitCreated: jest.fn(() => false) },
      logger(),
    );

    await service.deliverStaged([notification]);

    expect(markDeliveryFailure).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "n1",
        nextDeliveryAt: null,
        deadLetteredAt: expect.any(Date),
      }),
    );
  });

  it("allows an admin to retry a dead-letter notification", async () => {
    const notification = row("n1", "u1");
    const requeueDeadLetter = jest.fn(async () => notification);
    const claimForDelivery = jest.fn(async () => [notification]);
    const markDelivered = jest.fn(async () => ({ count: 1 }));
    const appLogger = logger();
    const service = await createService(
      { requeueDeadLetter, claimForDelivery, markDelivered },
      { emitCreated: jest.fn(() => true) },
      appLogger,
    );

    await expect(service.retryDeadLetter("n1", "admin-1")).resolves.toEqual({
      requeued: true,
      id: "n1",
    });
    expect(requeueDeadLetter).toHaveBeenCalledWith("n1");
    expect(appLogger.warn).toHaveBeenCalledWith(
      "notification.dead-letter.retry id=n1 requestedBy=admin-1",
      NotificationService.name,
    );
  });

  it("caps exponential retry backoff", async () => {
    const notification = row("n1", "u1");
    notification.deliveryAttempts = 7;
    const markDeliveryFailure = jest.fn(async () => ({ count: 1 }));
    const service = await createService(
      {
        claimForDelivery: jest.fn(async () => [notification]),
        markDeliveryFailure,
      },
      { emitCreated: jest.fn(() => false) },
      logger(),
    );
    const startedAt = Date.now();

    await service.deliverStaged([notification]);

    const [failure] = markDeliveryFailure.mock.calls[0] as unknown as [{ nextDeliveryAt: Date }];
    expect(failure.nextDeliveryAt.getTime()).toBeGreaterThanOrEqual(startedAt + 15 * 60 * 1000);
    expect(failure.nextDeliveryAt.getTime()).toBeLessThanOrEqual(startedAt + 15 * 60 * 1000 + 1000);
  });

  it("uses keyset paging without a total count when a cursor is passed", async () => {
    const listByCursor = jest.fn(async () => ({
      items: [row("n-1", "u1")],
      nextCursor: "n-1",
      hasNextPage: true,
    }));
    const list = jest.fn();
    const countUnread = jest.fn(async () => 4);
    const service = await createService({ listByCursor, list, countUnread });

    const result = await service.listWithUnread(
      { cursor: "", limit: 1 },
      { recipientType: NotificationRecipientType.USER, recipientId: "u1" },
    );

    expect(list).not.toHaveBeenCalled();
    expect(result).toEqual({
      items: [expect.objectContaining({ id: "n-1" })],
      nextCursor: "n-1",
      hasNextPage: true,
      unreadCount: 4,
    });
  });

  it("marks a notification read and syncs other tabs with the new unread count", async () => {
    const findOwned = jest.fn(async () => row("n1", "u1"));
    const markRead = jest.fn(async () => ({ id: "n1", readAt: new Date() }));
    const countUnread = jest.fn(async () => 2);
    const emitRead = jest.fn();
    const service = await createService({ findOwned, markRead, countUnread }, { emitRead });

    const result = await service.markRead({
      recipientType: NotificationRecipientType.USER,
      recipientId: "u1",
      id: "n1",
    });

    expect(markRead).toHaveBeenCalledWith({ id: "n1" });
    expect(result.readAt).toBeTruthy();
    expect(emitRead).toHaveBeenCalledWith(
      { recipientType: NotificationRecipientType.USER, recipientId: "u1", ids: ["n1"] },
      2,
    );
  });

  it("broadcasts read-all only when something changed", async () => {
    const markAllRead = jest.fn(async () => ({ count: 0 }));
    const emitRead = jest.fn();
    const service = await createService({ markAllRead }, { emitRead });

    await service.markAllRead({ recipientType: NotificationRecipientType.USER, recipientId: "u1" });

    expect(emitRead).not.toHaveBeenCalled();
  });

  it("broadcasts removals with the remaining unread count", async () => {
    const removeMany = jest.fn(async () => ({ count: 2 }));
    const countUnread = jest.fn(async () => 1);
    const emitRemoved = jest.fn();
    const service = await createService({ removeMany, countUnread }, { emitRemoved });

    await service.removeMany({
      recipientType: NotificationRecipientType.USER,
      recipientId: "u1",
      ids: ["n1", "n2"],
    });

    expect(emitRemoved).toHaveBeenCalledWith(
      { recipientType: NotificationRecipientType.USER, recipientId: "u1", ids: ["n1", "n2"] },
      1,
    );
  });
});
