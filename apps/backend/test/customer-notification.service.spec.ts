import { Test, type TestingModule } from "@nestjs/testing";
import { CustomerRepository } from "../src/modules/customer/repositories/customer.repository";
import { CustomerNotificationService } from "../src/modules/customer/services/notification.service";
import { NotificationService } from "../src/modules/notification/services/notification.service";
import { RecipientType } from "../src/modules/notification/types/notification";

const authRequest = {
  user: { sub: "user-1", sid: "s1", email: "a@b.com", roles: [] },
} as never;

describe("CustomerNotificationService", () => {
  it("lists inbox for the authenticated customer (USER + userId)", async () => {
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
        CustomerNotificationService,
        {
          provide: CustomerRepository,
          useValue: {
            findByUserId: async () => ({ id: "cust-1", userId: "user-1" }),
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

    const service = module.get(CustomerNotificationService);
    const result = await service.listNotifications({ page: 1, limit: 20 }, authRequest);

    expect(list).toHaveBeenCalledWith(
      { page: 1, limit: 20 },
      { recipientType: RecipientType.USER, recipientId: "user-1" },
    );
    expect(result.unreadCount).toBe(1);
    expect(result.items).toHaveLength(1);
  });

  it("marks all notifications read for the customer", async () => {
    const markAllRead = jest.fn(async () => ({ updated: 2 }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerNotificationService,
        {
          provide: CustomerRepository,
          useValue: {
            findByUserId: async () => ({ id: "cust-1", userId: "user-1" }),
          },
        },
        {
          provide: NotificationService,
          useValue: { markAllRead },
        },
      ],
    }).compile();

    const service = module.get(CustomerNotificationService);
    const result = await service.markAllNotificationsRead(authRequest);

    expect(markAllRead).toHaveBeenCalledWith({
      recipientType: RecipientType.USER,
      recipientId: "user-1",
    });
    expect(result.updated).toBe(2);
  });

  it("removes a single owned notification", async () => {
    const remove = jest.fn(async () => ({ deleted: true, id: "n1" }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerNotificationService,
        {
          provide: CustomerRepository,
          useValue: {
            findByUserId: async () => ({ id: "cust-1", userId: "user-1" }),
          },
        },
        {
          provide: NotificationService,
          useValue: { remove },
        },
      ],
    }).compile();

    const service = module.get(CustomerNotificationService);
    const result = await service.removeNotification("n1", authRequest);

    expect(remove).toHaveBeenCalledWith({
      recipientType: RecipientType.USER,
      recipientId: "user-1",
      id: "n1",
    });
    expect(result.deleted).toBe(true);
  });
});
