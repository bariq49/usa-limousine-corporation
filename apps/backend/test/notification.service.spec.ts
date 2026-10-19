import { Test } from "@nestjs/testing";
import type { TestingModule } from "@nestjs/testing";
import { NotificationRecipientType, NotificationType } from "@prisma/client";
import { NotificationRepository } from "../src/modules/notification/repositories/notification.repository";
import { NotificationDeliveryService } from "../src/modules/notification/services/notification-delivery.service";
import { NotificationService } from "../src/modules/notification/services/notification.service";

describe("NotificationService", () => {
  it("creates a notification and delivers it", async () => {
    const created = {
      id: "n1",
      recipientType: NotificationRecipientType.DRIVER,
      recipientId: "d1",
      type: NotificationType.TRIP_ACCEPTED,
      title: "Ride accepted",
      body: "You accepted booking BK-1",
      data: { tripId: "t1" },
      readAt: null,
      createdAt: new Date(),
    };
    const create = jest.fn(async () => created);
    const deliver = jest.fn(async () => undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: NotificationRepository, useValue: { create } },
        { provide: NotificationDeliveryService, useValue: { deliver } },
      ],
    }).compile();

    const service = module.get(NotificationService);
    const result = await service.notify({
      recipientType: NotificationRecipientType.DRIVER,
      recipientId: "d1",
      type: NotificationType.TRIP_ACCEPTED,
      title: "Ride accepted",
      body: "You accepted booking BK-1",
      data: { tripId: "t1" },
    });

    expect(create).toHaveBeenCalled();
    expect(deliver).toHaveBeenCalledWith({
      notification: created,
      push: true,
    });
    expect(result.id).toBe("n1");
  });

  it("returns existing row for duplicate idempotencyKey without re-delivery", async () => {
    const existing = {
      id: "n-existing",
      recipientType: NotificationRecipientType.DRIVER,
      recipientId: "d1",
      type: NotificationType.TRIP_ACCEPTED,
      title: "Ride accepted",
      body: "You accepted booking BK-1",
      data: null,
      idempotencyKey: "key-1",
      readAt: null,
      createdAt: new Date(),
    };
    const findByIdempotencyKey = jest.fn(async () => existing);
    const create = jest.fn();
    const deliver = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: NotificationRepository,
          useValue: { findByIdempotencyKey, create },
        },
        { provide: NotificationDeliveryService, useValue: { deliver } },
      ],
    }).compile();

    const service = module.get(NotificationService);
    const result = await service.notify({
      recipientType: NotificationRecipientType.DRIVER,
      recipientId: "d1",
      type: NotificationType.TRIP_ACCEPTED,
      title: "Ride accepted",
      body: "You accepted booking BK-1",
      idempotencyKey: "key-1",
    });

    expect(result.id).toBe("n-existing");
    expect(create).not.toHaveBeenCalled();
    expect(deliver).not.toHaveBeenCalled();
  });

  it("marks a notification as read for a recipient", async () => {
    const existing = {
      id: "n1",
      recipientType: NotificationRecipientType.DRIVER,
      recipientId: "d1",
      readAt: null,
    };
    const findOwned = jest.fn(async () => existing);
    const markRead = jest.fn(async () => {
      return { id: existing.id, readAt: new Date() };
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: NotificationRepository,
          useValue: { findOwned, markRead },
        },
        { provide: NotificationDeliveryService, useValue: {} },
      ],
    }).compile();

    const service = module.get(NotificationService);
    const result = await service.markRead({
      recipientType: NotificationRecipientType.DRIVER,
      recipientId: "d1",
      id: "n1",
    });

    expect(findOwned).toHaveBeenCalledWith({
      recipientType: NotificationRecipientType.DRIVER,
      recipientId: "d1",
      id: "n1",
    });
    expect(markRead).toHaveBeenCalledWith({ id: "n1" });
    expect(result.readAt).toBeTruthy();
  });

  it("notifies many recipients in batch via createManyAndReturn + deliverMany", async () => {
    const created = [
      {
        id: "n-d1",
        recipientType: NotificationRecipientType.DRIVER,
        recipientId: "d1",
        type: NotificationType.BOOKING_AVAILABLE,
        title: "New paid booking",
        body: "Booking BK-1 is available",
        data: { bookingId: "b1" },
        readAt: null,
        createdAt: new Date(),
      },
      {
        id: "n-d2",
        recipientType: NotificationRecipientType.DRIVER,
        recipientId: "d2",
        type: NotificationType.BOOKING_AVAILABLE,
        title: "New paid booking",
        body: "Booking BK-1 is available",
        data: { bookingId: "b1" },
        readAt: null,
        createdAt: new Date(),
      },
    ];
    const findByIdempotencyKeys = jest.fn(async () => []);
    const createManyAndReturn = jest.fn(async () => created);
    const deliverMany = jest.fn(async () => undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: NotificationRepository,
          useValue: { findByIdempotencyKeys, createManyAndReturn },
        },
        { provide: NotificationDeliveryService, useValue: { deliverMany } },
      ],
    }).compile();

    const service = module.get(NotificationService);
    const result = await service.notifyMany([
      {
        recipientType: NotificationRecipientType.DRIVER,
        recipientId: "d1",
        type: NotificationType.BOOKING_AVAILABLE,
        title: "New paid booking",
        body: "Booking BK-1 is available",
        data: { bookingId: "b1" },
        push: true,
      },
      {
        recipientType: NotificationRecipientType.DRIVER,
        recipientId: "d2",
        type: NotificationType.BOOKING_AVAILABLE,
        title: "New paid booking",
        body: "Booking BK-1 is available",
        data: { bookingId: "b1" },
        push: false,
      },
    ]);

    expect(createManyAndReturn).toHaveBeenCalledTimes(1);
    expect(deliverMany).toHaveBeenCalledWith({
      notifications: [created[1]],
      push: false,
    });
    expect(deliverMany).toHaveBeenCalledWith({
      notifications: [created[0]],
      push: true,
    });
    expect(result).toHaveLength(2);
  });
});
