import { BadRequestException } from "@nestjs/common";
import type { EventEmitter2 } from "@nestjs/event-emitter";
import { HelpTicketCategory, HelpTicketStatus } from "@prisma/client";
import type { PrismaService } from "../src/infrastructure/database/prisma.service";
import type { SequenceService } from "../src/infrastructure/sequence/sequence.service";
import { TICKET_EVENT } from "../src/modules/help-center/constants/ticket.events";
import type { TicketRepository } from "../src/modules/help-center/repositories/ticket.repository";
import { NotificationService as HelpCenterNotificationService } from "../src/modules/help-center/services/notification.service";
import type { NotificationService as AppNotificationService } from "../src/modules/notification/services/notification.service";
import { TicketService } from "../src/modules/help-center/services/ticket.service";

describe("TicketService", () => {
  const tickets = {
    findById: jest.fn(),
    updateStatus: jest.fn(),
    create: jest.fn(),
    addMessage: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  };
  const sequenceService = {
    nextHelpTicket: jest.fn(),
  };
  const tx = {
    user: {
      findMany: jest.fn(async () => [{ id: "admin-1" }]),
    },
  };
  const prisma = {
    auditLog: {
      create: jest.fn(),
    },
    $transaction: jest.fn(async (fn: (client: typeof tx) => Promise<unknown>) => fn(tx)),
  };
  const staged = [{ id: "notification-1" }];
  const appNotifications = {
    stage: jest.fn(async () => staged),
    deliverStaged: jest.fn(async () => undefined),
  };
  const notificationService = new HelpCenterNotificationService(
    appNotifications as unknown as AppNotificationService,
  );
  const events = {
    emit: jest.fn(),
  };

  const request = {
    headers: {},
    user: { sub: "user-1", sid: "s1", email: "u@test.com", roles: [] },
  } as never;

  let service: TicketService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TicketService(
      tickets as unknown as TicketRepository,
      sequenceService as unknown as SequenceService,
      prisma as unknown as PrismaService,
      events as unknown as EventEmitter2,
      notificationService as unknown as NotificationService,
    );
  });

  it("customer reply stores the message and notifies admins in one transaction", async () => {
    tickets.findById.mockResolvedValue({
      id: "ticket-1",
      status: HelpTicketStatus.OPEN,
      customerId: "customer-1",
      ticketNumber: "HC-000001",
      subject: "Wallet issue",
    });
    tickets.addMessage.mockResolvedValue({ id: "msg-9" });

    await service.customerReply("ticket-1", { body: "Any update?" }, request);

    expect(tickets.addMessage).toHaveBeenCalledWith(
      { ticketId: "ticket-1", authorUserId: "user-1", body: "Any update?" },
      tx,
    );
    expect(appNotifications.stage).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          recipientId: "admin-1",
          type: "TICKET_REPLY",
          idempotencyKey: "TICKET_CUSTOMER_REPLY:msg-9:admin-1",
        }),
      ]),
      tx,
    );
    expect(appNotifications.deliverStaged).toHaveBeenCalledWith(staged);
  });

  it("customer cannot reply to a closed ticket", async () => {
    tickets.findById.mockResolvedValue({ id: "ticket-1", status: HelpTicketStatus.CLOSED });

    await expect(
      service.customerReply("ticket-1", { body: "Hello" }, request),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(tickets.addMessage).not.toHaveBeenCalled();
  });

  it("rejects transitions from closed tickets", async () => {
    tickets.findById.mockResolvedValue({
      id: "ticket-1",
      status: HelpTicketStatus.CLOSED,
      customerId: "customer-1",
    });

    await expect(
      service.updateStatus("ticket-1", { status: HelpTicketStatus.OPEN }, {
        headers: {},
        user: { sub: "admin-user", sid: "s1", email: "a@test.com", roles: [] },
      } as never),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("rejects skipped lifecycle stages", async () => {
    tickets.findById.mockResolvedValue({
      id: "ticket-1",
      status: HelpTicketStatus.OPEN,
      customerId: "customer-1",
    });

    await expect(
      service.updateStatus("ticket-1", { status: HelpTicketStatus.RESOLVED }, {
        headers: {},
        user: { sub: "admin-user", sid: "s1", email: "a@test.com", roles: [] },
      } as never),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("creates tickets with PENDING status via repository", async () => {
    sequenceService.nextHelpTicket.mockResolvedValue(1);
    tickets.create.mockResolvedValue({
      id: "ticket-1",
      ticketNumber: "HC-000001",
      status: HelpTicketStatus.PENDING,
      category: HelpTicketCategory.OTHER,
      subject: "Wallet issue",
      customerId: "customer-1",
      customer: { user: { id: "customer-user-1" } },
    });

    const result = await service.create(
      {
        customerId: "customer-1",
        subject: "Wallet issue",
        description: "My wallet balance looks incorrect after a trip.",
      },
      request,
    );

    expect(sequenceService.nextHelpTicket).toHaveBeenCalledTimes(1);
    expect(tickets.create).toHaveBeenCalledWith(
      expect.objectContaining({
        customerId: "customer-1",
        category: HelpTicketCategory.OTHER,
        ticketNumber: "HC-000001",
        actorUserId: "user-1",
      }),
      tx,
    );
    expect(appNotifications.stage).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          recipientId: "admin-1",
          type: "TICKET_CREATED",
          idempotencyKey: "TICKET_CREATED:ticket-1:admin-1",
        }),
      ]),
      tx,
    );
    expect(appNotifications.deliverStaged).toHaveBeenCalledWith(staged.concat(staged));
    expect(events.emit).toHaveBeenCalledWith(
      TICKET_EVENT.CREATED,
      expect.objectContaining({
        customerId: "customer-1",
        actorUserId: "user-1",
        ticketId: "ticket-1",
        ticketNumber: "HC-000001",
      }),
    );
    expect(result.status).toBe(HelpTicketStatus.PENDING);
  });

  it("emits created event for customer tickets", async () => {
    sequenceService.nextHelpTicket.mockResolvedValue(2);
    tickets.create.mockResolvedValue({
      id: "ticket-2",
      ticketNumber: "HC-000002",
      status: HelpTicketStatus.PENDING,
      category: HelpTicketCategory.OTHER,
      subject: "Billing question",
      customerId: "customer-1",
      customer: { user: { id: "customer-user-1" } },
    });

    await service.create(
      {
        customerId: "customer-1",
        subject: "Billing question",
        description: "I was charged twice.",
      },
      request,
    );

    expect(events.emit).toHaveBeenCalledWith(
      TICKET_EVENT.CREATED,
      expect.objectContaining({
        customerId: "customer-1",
        ticketId: "ticket-2",
      }),
    );
  });

  it("emits status updated when a ticket is resolved", async () => {
    const resolved = {
      id: "ticket-1",
      status: HelpTicketStatus.RESOLVED,
      customerId: "customer-1",
      ticketNumber: "HC-000001",
      subject: "Wallet issue",
      description: "My wallet balance looks incorrect after a trip.",
      category: HelpTicketCategory.OTHER,
      priority: "MEDIUM" as never,
      resolvedAt: new Date("2026-08-24T00:00:00.000Z"),
      createdAt: new Date("2026-08-23T00:00:00.000Z"),
      updatedAt: new Date("2026-08-24T00:00:00.000Z"),
    };

    tickets.findById.mockResolvedValue({
      id: "ticket-1",
      status: HelpTicketStatus.IN_PROGRESS,
      customerId: "customer-1",
      ticketNumber: "HC-000001",
      subject: "Wallet issue",
      customer: { user: { id: "customer-user-1" } },
    });
    tickets.updateStatus.mockResolvedValue(resolved);

    await service.updateStatus("ticket-1", { status: HelpTicketStatus.RESOLVED }, {
      headers: {},
      user: { sub: "admin-user", sid: "s1", email: "a@test.com", roles: [] },
    } as never);

    expect(events.emit).toHaveBeenCalledWith(
      TICKET_EVENT.STATUS_UPDATED,
      expect.objectContaining({
        customerId: "customer-1",
        actorUserId: "admin-user",
        from: HelpTicketStatus.IN_PROGRESS,
        to: HelpTicketStatus.RESOLVED,
      }),
    );
    expect(appNotifications.stage).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          recipientId: "customer-user-1",
          type: "TICKET_RESOLVED",
          idempotencyKey: `TICKET_STATUS:ticket-1:${resolved.updatedAt.getTime()}`,
        }),
      ],
      tx,
    );
    expect(appNotifications.deliverStaged).toHaveBeenCalledWith(staged);
  });

  it("stages customer notifications without customer preferences", async () => {
    tickets.findById.mockResolvedValue({
      id: "ticket-1",
      status: HelpTicketStatus.IN_PROGRESS,
      customerId: "customer-1",
      ticketNumber: "HC-000001",
      subject: "Wallet issue",
      customer: { user: { id: "customer-user-1" } },
    });
    tickets.updateStatus.mockResolvedValue({
      id: "ticket-1",
      status: HelpTicketStatus.RESOLVED,
      updatedAt: new Date("2026-08-24T00:00:00.000Z"),
    });

    await service.updateStatus("ticket-1", { status: HelpTicketStatus.RESOLVED }, {
      headers: {},
      user: { sub: "admin-user", sid: "s1", email: "a@test.com", roles: [] },
    } as never);

    expect(appNotifications.stage).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          recipientId: "customer-user-1",
          type: "TICKET_RESOLVED",
        }),
      ],
      tx,
    );
    expect(appNotifications.deliverStaged).toHaveBeenCalledWith(staged);
  });

  it("emits status updated on non-resolved status changes", async () => {
    const updated = {
      id: "ticket-1",
      status: HelpTicketStatus.OPEN,
      customerId: "customer-1",
      ticketNumber: "HC-000001",
      subject: "Wallet issue",
      updatedAt: new Date("2026-08-24T00:00:00.000Z"),
    };

    tickets.findById.mockResolvedValue({
      id: "ticket-1",
      status: HelpTicketStatus.PENDING,
      customerId: "customer-1",
      ticketNumber: "HC-000001",
      subject: "Wallet issue",
    });
    tickets.updateStatus.mockResolvedValue(updated);

    await service.updateStatus("ticket-1", { status: HelpTicketStatus.OPEN }, {
      headers: {},
      user: { sub: "admin-user", sid: "s1", email: "a@test.com", roles: [] },
    } as never);

    expect(events.emit).toHaveBeenCalledWith(
      TICKET_EVENT.STATUS_UPDATED,
      expect.objectContaining({
        from: HelpTicketStatus.PENDING,
        to: HelpTicketStatus.OPEN,
      }),
    );
  });

  it("permanently deletes a ticket", async () => {
    tickets.findById.mockResolvedValue({
      id: "ticket-1",
      ticketNumber: "HC-000001",
      status: HelpTicketStatus.CLOSED,
      customerId: "customer-1",
    });
    tickets.delete.mockResolvedValue({
      id: "ticket-1",
      ticketNumber: "HC-000001",
    });

    await service.remove("ticket-1", {
      headers: {},
      user: { sub: "admin-user", sid: "s1", email: "a@test.com", roles: [] },
    } as never);

    expect(tickets.delete).toHaveBeenCalledWith("ticket-1");
  });

  it("permanently bulk deletes tickets", async () => {
    tickets.deleteMany.mockResolvedValue({ count: 2 });

    const result = await service.bulkRemove(["ticket-1", "ticket-2"], {
      headers: {},
      user: { sub: "admin-user", sid: "s1", email: "a@test.com", roles: [] },
    } as never);

    expect(tickets.deleteMany).toHaveBeenCalledWith(["ticket-1", "ticket-2"]);
    expect(result).toEqual({ success: true, count: 2 });
  });

  it("emits replied when admin replies", async () => {
    tickets.findById
      .mockResolvedValueOnce({
        id: "ticket-1",
        status: HelpTicketStatus.OPEN,
        customerId: "customer-1",
        ticketNumber: "HC-000001",
        subject: "Wallet issue",
      })
      .mockResolvedValueOnce({
        id: "ticket-1",
        status: HelpTicketStatus.OPEN,
        customerId: "customer-1",
        ticketNumber: "HC-000001",
        subject: "Wallet issue",
        messages: [],
      });
    tickets.addMessage.mockResolvedValue({
      id: "msg-1",
      body: "We are looking into this.",
    });

    await service.reply("ticket-1", { body: "We are looking into this." }, {
      headers: {},
      user: { sub: "admin-user", sid: "s1", email: "a@test.com", roles: [] },
    } as never);

    expect(events.emit).toHaveBeenCalledWith(
      TICKET_EVENT.REPLIED,
      expect.objectContaining({
        customerId: "customer-1",
        actorUserId: "admin-user",
        ticketNumber: "HC-000001",
        messageId: "msg-1",
      }),
    );
  });
});
