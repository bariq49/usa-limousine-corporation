import { Test, type TestingModule } from "@nestjs/testing";
import { DriverRepository } from "../src/modules/driver/repositories/driver.repository";
import { DriverNotificationService } from "../src/modules/driver/services/notification.service";
import { NotificationService } from "../src/modules/notification/services/notification.service";
import { RecipientType } from "../src/modules/notification/types/notification";

const authRequest = {
  user: { sub: "user-1", sid: "s1", email: "a@b.com", roles: [] },
} as never;

describe("DriverNotificationService", () => {
  it("lists inbox for the authenticated driver", async () => {
    const list = jest.fn(async () => ({
      items: [{ id: "n1" }],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    }));
    const countUnread = jest.fn(async () => 1);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DriverNotificationService,
        {
          provide: DriverRepository,
          useValue: {
            findByUserId: async () => ({ id: "driver-1" }),
          },
        },
        {
          provide: NotificationService,
          useValue: {
            list,
            countUnread,
          },
        },
      ],
    }).compile();

    const service = module.get(DriverNotificationService);
    const result = await service.listNotifications({ page: 1, limit: 20 }, authRequest);

    expect(list).toHaveBeenCalledWith(
      { page: 1, limit: 20 },
      { recipientType: RecipientType.DRIVER, recipientId: "driver-1" },
    );
    expect(result.unreadCount).toBe(1);
    expect(result.items).toHaveLength(1);
  });

  it("marks all notifications read for the driver", async () => {
    const markAllRead = jest.fn(async () => ({ updated: 3 }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DriverNotificationService,
        {
          provide: DriverRepository,
          useValue: {
            findByUserId: async () => ({ id: "driver-1" }),
          },
        },
        {
          provide: NotificationService,
          useValue: { markAllRead },
        },
      ],
    }).compile();

    const service = module.get(DriverNotificationService);
    const result = await service.markAllNotificationsRead(authRequest);

    expect(markAllRead).toHaveBeenCalledWith({
      recipientType: RecipientType.DRIVER,
      recipientId: "driver-1",
    });
    expect(result.updated).toBe(3);
  });

  it("removes a single owned notification", async () => {
    const remove = jest.fn(async () => ({ deleted: true, id: "n1" }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DriverNotificationService,
        {
          provide: DriverRepository,
          useValue: {
            findByUserId: async () => ({ id: "driver-1" }),
          },
        },
        {
          provide: NotificationService,
          useValue: { remove },
        },
      ],
    }).compile();

    const service = module.get(DriverNotificationService);
    const result = await service.removeNotification("n1", authRequest);

    expect(remove).toHaveBeenCalledWith({
      recipientType: RecipientType.DRIVER,
      recipientId: "driver-1",
      id: "n1",
    });
    expect(result.deleted).toBe(true);
  });

  it("bulk removes owned notifications", async () => {
    const removeMany = jest.fn(async () => ({ deleted: 2 }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DriverNotificationService,
        {
          provide: DriverRepository,
          useValue: {
            findByUserId: async () => ({ id: "driver-1" }),
          },
        },
        {
          provide: NotificationService,
          useValue: { removeMany },
        },
      ],
    }).compile();

    const service = module.get(DriverNotificationService);
    const result = await service.removeNotifications({ ids: ["n1", "n2"] }, authRequest);

    expect(removeMany).toHaveBeenCalledWith({
      recipientType: RecipientType.DRIVER,
      recipientId: "driver-1",
      ids: ["n1", "n2"],
    });
    expect(result.deleted).toBe(2);
  });
});
