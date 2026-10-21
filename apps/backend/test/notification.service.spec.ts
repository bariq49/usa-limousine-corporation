import { Test } from "@nestjs/testing";
import type { TestingModule } from "@nestjs/testing";
import { NotificationRecipientType, NotificationType } from "@prisma/client";
import { NotificationRepository } from "../src/modules/notification/repositories/notification.repository";
import { NotificationDeliveryService } from "../src/modules/notification/services/notification-delivery.service";
import { NotificationService } from "../src/modules/notification/services/notification.service";
import { NotificationRealtimeService } from "../src/modules/notification/websocket/notification-realtime.service";

async function createService(repository: object, delivery: object = {}, realtime: object = {}) {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      NotificationService,
      { provide: NotificationRepository, useValue: repository },
      { provide: NotificationDeliveryService, useValue: delivery },
      { provide: NotificationRealtimeService, useValue: realtime },
    ],
  }).compile();

  return module.get(NotificationService);
}

function row(id: string, recipientId: string, push: boolean) {
  return {
    id,
    recipientType: NotificationRecipientType.USER,
    recipientId,
    type: NotificationType.BOOKING_CREATED,
    title: "New booking",
    body: "Booking BK-1 was created.",
    data: { bookingId: "b1" },
    idempotencyKey: null,
    push,
    readAt: null,
    deliveredAt: null,
    createdAt: new Date(),
  };
}

describe("NotificationService", () => {
  it("creates a notification and delivers it", async () => {
    const created = row("n1", "u1", true);
    const create = jest.fn(async () => created);
    const deliver = jest.fn(async () => undefined);
    const service = await createService({ create }, { deliver });

    const result = await service.notify({
      recipientType: NotificationRecipientType.USER,
      recipientId: "u1",
      type: NotificationType.BOOKING_CREATED,
      title: "New booking",
      body: "Booking BK-1 was created.",
      data: { bookingId: "b1" },
    });

    expect(create).toHaveBeenCalled();
    expect(deliver).toHaveBeenCalledWith({ notification: created });
    expect(result.id).toBe("n1");
  });

  it("returns existing row for duplicate idempotencyKey without re-delivery", async () => {
    const existing = row("n-existing", "u1", true);
    const findByIdempotencyKey = jest.fn(async () => existing);
    const create = jest.fn();
    const deliver = jest.fn();
    const service = await createService({ findByIdempotencyKey, create }, { deliver });

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
    expect(deliver).not.toHaveBeenCalled();
  });

  it("notifies many recipients in one insert and one deliverMany", async () => {
    const created = [row("n-1", "u1", true), row("n-2", "u2", false)];
    const findByIdempotencyKeys = jest.fn(async () => []);
    const createManyAndReturn = jest.fn(async () => created);
    const deliverMany = jest.fn(async () => undefined);
    const service = await createService(
      { findByIdempotencyKeys, createManyAndReturn },
      { deliverMany },
    );

    const result = await service.notifyMany([
      {
        recipientType: NotificationRecipientType.USER,
        recipientId: "u1",
        type: NotificationType.BOOKING_CREATED,
        title: "New booking",
        body: "Booking BK-1 was created.",
        push: true,
      },
      {
        recipientType: NotificationRecipientType.USER,
        recipientId: "u2",
        type: NotificationType.BOOKING_CREATED,
        title: "New booking",
        body: "Booking BK-1 was created.",
        push: false,
      },
    ]);

    expect(createManyAndReturn).toHaveBeenCalledTimes(1);
    expect(deliverMany).toHaveBeenCalledWith({ notifications: created });
    expect(result).toHaveLength(2);
  });

  it("stages one row per admin on the caller's transaction with per-admin idempotency keys", async () => {
    const tx = { marker: "tx" };
    const findAdminUserIds = jest.fn(async () => ["admin-1", "admin-2"]);
    const createManyAndReturn = jest.fn(async () => [row("n-1", "admin-1", false)]);
    const service = await createService({ findAdminUserIds, createManyAndReturn });

    await service.stageForAdmins(
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

    expect(findAdminUserIds).toHaveBeenCalledWith("customer-user", tx);
    expect(createManyAndReturn).toHaveBeenCalledWith(
      {
        inputs: [
          expect.objectContaining({
            recipientId: "admin-1",
            push: false,
            idempotencyKey: "BOOKING_CREATED:b1:admin-1",
          }),
          expect.objectContaining({
            recipientId: "admin-2",
            push: false,
            idempotencyKey: "BOOKING_CREATED:b1:admin-2",
          }),
        ],
      },
      tx,
    );
  });

  it("delivers staged rows after commit", async () => {
    const deliverMany = jest.fn(async () => undefined);
    const service = await createService({}, { deliverMany });
    const staged = [row("n-1", "admin-1", false)];

    await service.deliverStaged(staged as never);

    expect(deliverMany).toHaveBeenCalledWith({ notifications: staged });
  });

  it("uses keyset paging without a total count when a cursor is passed", async () => {
    const listByCursor = jest.fn(async () => ({
      items: [row("n-1", "u1", true)],
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
    const findOwned = jest.fn(async () => row("n1", "u1", true));
    const markRead = jest.fn(async () => ({ id: "n1", readAt: new Date() }));
    const countUnread = jest.fn(async () => 2);
    const emitRead = jest.fn();
    const service = await createService({ findOwned, markRead, countUnread }, {}, { emitRead });

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
    const service = await createService({ markAllRead }, {}, { emitRead });

    await service.markAllRead({ recipientType: NotificationRecipientType.USER, recipientId: "u1" });

    expect(emitRead).not.toHaveBeenCalled();
  });

  it("broadcasts removals with the remaining unread count", async () => {
    const removeMany = jest.fn(async () => ({ count: 2 }));
    const countUnread = jest.fn(async () => 1);
    const emitRemoved = jest.fn();
    const service = await createService({ removeMany, countUnread }, {}, { emitRemoved });

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
