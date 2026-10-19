import { HelpTicketCategory, HelpTicketOwnerType, HelpTicketStatus } from "@prisma/client";
import type { ActivityService } from "../src/modules/activity/services/activity.service";
import { TicketActivityListener } from "../src/modules/help-center/listeners/ticket-activity.listener";

describe("TicketActivityListener", () => {
  const activities = {
    record: jest.fn(),
  };

  let listener: TicketActivityListener;

  beforeEach(() => {
    jest.clearAllMocks();
    activities.record.mockResolvedValue({});
    listener = new TicketActivityListener(activities as unknown as ActivityService);
  });

  it("records activity for driver ticket created", async () => {
    await listener.onCreated({
      ownerType: HelpTicketOwnerType.DRIVER,
      ownerId: "driver-1",
      actorUserId: "user-1",
      ticketId: "ticket-1",
      ticketNumber: "HC-000001",
      subject: "Wallet issue",
      category: HelpTicketCategory.OTHER,
      status: HelpTicketStatus.PENDING,
    });

    expect(activities.record).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerType: "DRIVER",
        ownerId: "driver-1",
        type: "TICKET_CREATED",
        actorType: "USER",
        actorId: "user-1",
      }),
    );
  });

  it("records activity for customer ticket created", async () => {
    await listener.onCreated({
      ownerType: HelpTicketOwnerType.CUSTOMER,
      ownerId: "customer-1",
      actorUserId: "user-2",
      ticketId: "ticket-2",
      ticketNumber: "HC-000002",
      subject: "Billing question",
      category: HelpTicketCategory.PAYMENTS,
      status: HelpTicketStatus.PENDING,
    });

    expect(activities.record).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerType: "CUSTOMER",
        ownerId: "customer-1",
        type: "TICKET_CREATED",
      }),
    );
  });

  it("records reply activity", async () => {
    await listener.onReplied({
      ownerType: HelpTicketOwnerType.DRIVER,
      ownerId: "driver-1",
      actorUserId: "admin-1",
      ticketId: "ticket-1",
      ticketNumber: "HC-000001",
      subject: "Wallet issue",
      messageId: "msg-1",
    });

    expect(activities.record).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "TICKET_REPLIED",
        data: expect.objectContaining({
          messageId: "msg-1",
        }),
      }),
    );
  });

  it("records status updated activity", async () => {
    await listener.onStatusUpdated({
      ownerType: HelpTicketOwnerType.CUSTOMER,
      ownerId: "customer-1",
      actorUserId: "admin-1",
      ticketId: "ticket-2",
      ticketNumber: "HC-000002",
      subject: "Billing question",
      from: HelpTicketStatus.OPEN,
      to: HelpTicketStatus.RESOLVED,
      note: null,
    });

    expect(activities.record).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerType: "CUSTOMER",
        type: "TICKET_STATUS_UPDATED",
        data: expect.objectContaining({
          from: HelpTicketStatus.OPEN,
          to: HelpTicketStatus.RESOLVED,
        }),
      }),
    );
  });
});
