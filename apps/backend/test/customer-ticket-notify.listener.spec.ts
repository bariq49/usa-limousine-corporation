import { HelpTicketOwnerType, HelpTicketStatus } from "@prisma/client";
import type { PrismaService } from "../src/infrastructure/database/prisma.service";
import { TicketNotifyListener } from "../src/modules/customer/listeners/ticket-notify.listener";
import type { NotificationService } from "../src/modules/notification/services/notification.service";

describe("Customer TicketNotifyListener", () => {
  const notifications = { notify: jest.fn() };
  const prisma = { customer: { findUnique: jest.fn() } };
  let listener: TicketNotifyListener;

  beforeEach(() => {
    jest.clearAllMocks();
    notifications.notify.mockResolvedValue({});
    prisma.customer.findUnique.mockResolvedValue({ userId: "user-9" });
    listener = new TicketNotifyListener(
      notifications as unknown as NotificationService,
      prisma as unknown as PrismaService,
    );
  });

  it("notifies customer user on reply", async () => {
    await listener.onReply({
      ownerType: HelpTicketOwnerType.CUSTOMER,
      ownerId: "customer-1",
      actorUserId: "admin-1",
      ticketId: "ticket-2",
      ticketNumber: "HC-000002",
      subject: "Billing question",
      messageId: "msg-2",
    });

    expect(notifications.notify).toHaveBeenCalledWith(
      expect.objectContaining({
        recipientType: "USER",
        recipientId: "user-9",
        type: "TICKET_REPLY",
        push: true,
      }),
    );
  });

  it("ignores driver tickets", async () => {
    await listener.onReply({
      ownerType: HelpTicketOwnerType.DRIVER,
      ownerId: "driver-1",
      actorUserId: "admin-1",
      ticketId: "ticket-1",
      ticketNumber: "HC-000001",
      subject: "Wallet",
      messageId: "msg-1",
    });

    expect(notifications.notify).not.toHaveBeenCalled();
  });

  it("notifies customer without push on non-resolved status", async () => {
    await listener.onStatus({
      ownerType: HelpTicketOwnerType.CUSTOMER,
      ownerId: "customer-1",
      actorUserId: "admin-1",
      ticketId: "ticket-2",
      ticketNumber: "HC-000002",
      subject: "Billing question",
      from: HelpTicketStatus.PENDING,
      to: HelpTicketStatus.IN_PROGRESS,
      note: null,
    });

    expect(notifications.notify).toHaveBeenCalledWith(
      expect.objectContaining({
        recipientType: "USER",
        recipientId: "user-9",
        type: "TICKET_STATUS_UPDATED",
        push: false,
      }),
    );
  });
});
