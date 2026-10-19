import { HelpTicketOwnerType, HelpTicketStatus } from "@prisma/client";
import { TicketNotifyListener } from "../src/modules/driver/listeners/ticket-notify.listener";
import type { NotificationService } from "../src/modules/notification/services/notification.service";

describe("Driver TicketNotifyListener", () => {
  const notifications = { notify: jest.fn() };
  let listener: TicketNotifyListener;

  beforeEach(() => {
    jest.clearAllMocks();
    notifications.notify.mockResolvedValue({});
    listener = new TicketNotifyListener(notifications as unknown as NotificationService);
  });

  it("notifies driver on reply", async () => {
    await listener.onReply({
      ownerType: HelpTicketOwnerType.DRIVER,
      ownerId: "driver-1",
      actorUserId: "admin-1",
      ticketId: "ticket-1",
      ticketNumber: "HC-000001",
      subject: "Wallet issue",
      messageId: "msg-1",
    });

    expect(notifications.notify).toHaveBeenCalledWith(
      expect.objectContaining({
        recipientType: "DRIVER",
        recipientId: "driver-1",
        type: "TICKET_REPLY",
        push: true,
      }),
    );
  });

  it("ignores customer tickets", async () => {
    await listener.onReply({
      ownerType: HelpTicketOwnerType.CUSTOMER,
      ownerId: "customer-1",
      actorUserId: "admin-1",
      ticketId: "ticket-2",
      ticketNumber: "HC-000002",
      subject: "Billing",
      messageId: "msg-2",
    });

    expect(notifications.notify).not.toHaveBeenCalled();
  });

  it("notifies driver when resolved", async () => {
    await listener.onStatus({
      ownerType: HelpTicketOwnerType.DRIVER,
      ownerId: "driver-1",
      actorUserId: "admin-1",
      ticketId: "ticket-1",
      ticketNumber: "HC-000001",
      subject: "Wallet issue",
      from: HelpTicketStatus.IN_PROGRESS,
      to: HelpTicketStatus.RESOLVED,
      note: null,
    });

    expect(notifications.notify).toHaveBeenCalledWith(
      expect.objectContaining({
        recipientId: "driver-1",
        type: "TICKET_RESOLVED",
        push: true,
      }),
    );
  });
});
