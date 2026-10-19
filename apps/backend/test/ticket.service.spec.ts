import { BadRequestException } from "@nestjs/common";
import type { EventEmitter2 } from "@nestjs/event-emitter";
import { HelpTicketCategory, HelpTicketOwnerType, HelpTicketStatus } from "@prisma/client";
import type { PrismaService } from "../src/infrastructure/database/prisma.service";
import type { SequenceService } from "../src/infrastructure/sequence/sequence.service";
import { TICKET_EVENT } from "../src/modules/help-center/constants/ticket.events";
import type { TicketRepository } from "../src/modules/help-center/repositories/ticket.repository";
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
    allocate: jest.fn(),
  };
  const prisma = {
    auditLog: {
      create: jest.fn(),
    },
    customer: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    driver: {
      findFirst: jest.fn(),
    },
  };
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
    prisma.driver.findFirst.mockResolvedValue({
      firstName: "Test",
      lastName: "Driver",
      email: "driver@test.com",
    });
    prisma.customer.findFirst.mockResolvedValue(null);
    service = new TicketService(
      tickets as unknown as TicketRepository,
      sequenceService as unknown as SequenceService,
      prisma as unknown as PrismaService,
      events as unknown as EventEmitter2,
    );
  });

  it("rejects transitions from closed tickets", async () => {
    tickets.findById.mockResolvedValue({
      id: "ticket-1",
      status: HelpTicketStatus.CLOSED,
      ownerType: HelpTicketOwnerType.DRIVER,
      ownerId: "driver-1",
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
      ownerType: HelpTicketOwnerType.DRIVER,
      ownerId: "driver-1",
    });

    await expect(
      service.updateStatus("ticket-1", { status: HelpTicketStatus.RESOLVED }, {
        headers: {},
        user: { sub: "admin-user", sid: "s1", email: "a@test.com", roles: [] },
      } as never),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("creates tickets with PENDING status via repository", async () => {
    sequenceService.allocate.mockResolvedValue("HC-000001");
    tickets.create.mockResolvedValue({
      id: "ticket-1",
      ticketNumber: "HC-000001",
      status: HelpTicketStatus.PENDING,
      category: HelpTicketCategory.OTHER,
      subject: "Wallet issue",
      ownerType: HelpTicketOwnerType.DRIVER,
      ownerId: "driver-1",
    });

    const result = await service.create(
      {
        ownerType: HelpTicketOwnerType.DRIVER,
        ownerId: "driver-1",
        subject: "Wallet issue",
        description: "My wallet balance looks incorrect after a trip.",
      },
      request,
    );

    expect(sequenceService.allocate).toHaveBeenCalledWith({
      counterId: "help-ticket",
      prefix: "HC",
    });
    expect(tickets.create).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerType: HelpTicketOwnerType.DRIVER,
        ownerId: "driver-1",
        category: HelpTicketCategory.OTHER,
        ticketNumber: "HC-000001",
        actorUserId: "user-1",
      }),
    );
    expect(events.emit).toHaveBeenCalledWith(
      TICKET_EVENT.CREATED,
      expect.objectContaining({
        ownerType: HelpTicketOwnerType.DRIVER,
        ownerId: "driver-1",
        actorUserId: "user-1",
        ticketId: "ticket-1",
        ticketNumber: "HC-000001",
      }),
    );
    expect(result.status).toBe(HelpTicketStatus.PENDING);
  });

  it("emits created event for customer tickets", async () => {
    sequenceService.allocate.mockResolvedValue("HC-000002");
    tickets.create.mockResolvedValue({
      id: "ticket-2",
      ticketNumber: "HC-000002",
      status: HelpTicketStatus.PENDING,
      category: HelpTicketCategory.OTHER,
      subject: "Billing question",
      ownerType: HelpTicketOwnerType.CUSTOMER,
      ownerId: "customer-1",
    });

    await service.create(
      {
        ownerType: HelpTicketOwnerType.CUSTOMER,
        ownerId: "customer-1",
        subject: "Billing question",
        description: "I was charged twice.",
      },
      request,
    );

    expect(events.emit).toHaveBeenCalledWith(
      TICKET_EVENT.CREATED,
      expect.objectContaining({
        ownerType: HelpTicketOwnerType.CUSTOMER,
        ownerId: "customer-1",
        ticketId: "ticket-2",
      }),
    );
  });

  it("emits status updated when a ticket is resolved", async () => {
    const resolved = {
      id: "ticket-1",
      status: HelpTicketStatus.RESOLVED,
      ownerType: HelpTicketOwnerType.DRIVER,
      ownerId: "driver-1",
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
      ownerType: HelpTicketOwnerType.DRIVER,
      ownerId: "driver-1",
      ticketNumber: "HC-000001",
      subject: "Wallet issue",
    });
    tickets.updateStatus.mockResolvedValue(resolved);

    await service.updateStatus("ticket-1", { status: HelpTicketStatus.RESOLVED }, {
      headers: {},
      user: { sub: "admin-user", sid: "s1", email: "a@test.com", roles: [] },
    } as never);

    expect(events.emit).toHaveBeenCalledWith(
      TICKET_EVENT.STATUS_UPDATED,
      expect.objectContaining({
        ownerType: HelpTicketOwnerType.DRIVER,
        ownerId: "driver-1",
        actorUserId: "admin-user",
        from: HelpTicketStatus.IN_PROGRESS,
        to: HelpTicketStatus.RESOLVED,
      }),
    );
  });

  it("emits status updated on non-resolved status changes", async () => {
    const updated = {
      id: "ticket-1",
      status: HelpTicketStatus.OPEN,
      ownerType: HelpTicketOwnerType.DRIVER,
      ownerId: "driver-1",
      ticketNumber: "HC-000001",
      subject: "Wallet issue",
    };

    tickets.findById.mockResolvedValue({
      id: "ticket-1",
      status: HelpTicketStatus.PENDING,
      ownerType: HelpTicketOwnerType.DRIVER,
      ownerId: "driver-1",
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
      ownerType: HelpTicketOwnerType.DRIVER,
      ownerId: "driver-1",
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
        ownerType: HelpTicketOwnerType.DRIVER,
        ownerId: "driver-1",
        ticketNumber: "HC-000001",
        subject: "Wallet issue",
      })
      .mockResolvedValueOnce({
        id: "ticket-1",
        status: HelpTicketStatus.OPEN,
        ownerType: HelpTicketOwnerType.DRIVER,
        ownerId: "driver-1",
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
        ownerType: HelpTicketOwnerType.DRIVER,
        ownerId: "driver-1",
        actorUserId: "admin-user",
        ticketNumber: "HC-000001",
        messageId: "msg-1",
      }),
    );
  });
});
