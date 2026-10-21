import { Inject, Injectable } from "@nestjs/common";
import { HelpTicketEventType, HelpTicketStatus, type Prisma } from "@prisma/client";
import { APIFeature } from "../../../common/api-feature";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import type { QueryDto } from "../dto/ticket.dto";
import type { CreateData, MessageData, PriorityData, StatusData } from "../types/ticket";

/** Owner name/email/phone come from the customer's user (no copied columns). */
const customerSummary = {
  select: {
    id: true,
    type: true,
    user: {
      select: { id: true, firstName: true, lastName: true, email: true, phone: true },
    },
  },
} as const;

const ticketInclude = {
  customer: customerSummary,
  messages: {
    orderBy: { createdAt: "asc" as const },
    include: {
      author: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  },
  events: {
    orderBy: { createdAt: "desc" as const },
    take: 20,
    include: {
      actor: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  },
} satisfies Prisma.HelpTicketInclude;

@Injectable()
export class TicketRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  findMany(query: QueryDto) {
    const initialFilter: Prisma.HelpTicketWhereInput = {
      deletedAt: null,
    };

    const feature = new APIFeature(query, {
      initialFilter,
      filterFields: ["status", "category", "priority", "customerId"],
      search: {
        searchFields: [
          "ticketNumber",
          "subject",
          "customer.user.email",
          "customer.user.firstName",
          "customer.user.lastName",
        ],
      },
      sort: {
        allowedFields: ["createdAt", "updatedAt", "status", "priority", "ticketNumber"],
        defaultSortBy: "createdAt",
        defaultSortOrder: "desc",
      },
      pagination: {
        defaultLimit: 20,
        maxLimit: 100,
      },
      dateRange: {
        field: "createdAt",
      },
    });

    return feature.execute({
      findMany: (args) =>
        this.prisma.helpTicket.findMany({
          where: args.where as never,
          orderBy: args.orderBy as never,
          skip: args.skip,
          take: args.take,
          include: { customer: customerSummary },
        }),
      count: ({ where }) => this.prisma.helpTicket.count({ where: where as never }),
    });
  }

  findById(id: string) {
    return this.prisma.helpTicket.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: ticketInclude,
    });
  }

  /** Runs on the caller's transaction so related writes (e.g. notifications) commit together. */
  async create(data: CreateData, tx: Prisma.TransactionClient) {
    const ticket = await tx.helpTicket.create({
      data: {
        ticketNumber: data.ticketNumber,
        customerId: data.customerId,
        subject: data.subject,
        description: data.description,
        attachment: data.attachment,
        category: data.category,
        status: HelpTicketStatus.PENDING,
        priority: data.priority,
      },
    });

    await tx.helpTicketMessage.create({
      data: {
        ticketId: ticket.id,
        authorUserId: data.actorUserId,
        body: data.description,
      },
    });

    await tx.helpTicketEvent.create({
      data: {
        ticketId: ticket.id,
        event: HelpTicketEventType.CREATED,
        actorUserId: data.actorUserId,
        newStatus: HelpTicketStatus.PENDING,
      },
    });

    return tx.helpTicket.findUniqueOrThrow({
      where: { id: ticket.id },
      include: ticketInclude,
    });
  }

  /** Runs on the caller's transaction so related writes (e.g. notifications) commit together. */
  async addMessage(data: MessageData, tx: Prisma.TransactionClient) {
    const message = await tx.helpTicketMessage.create({
      data: {
        ticketId: data.ticketId,
        authorUserId: data.authorUserId,
        body: data.body,
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    await tx.helpTicketEvent.create({
      data: {
        ticketId: data.ticketId,
        event: HelpTicketEventType.MESSAGE_ADDED,
        actorUserId: data.authorUserId,
      },
    });

    return message;
  }

  /** Runs on the caller's transaction so related writes (e.g. notifications) commit together. */
  async updateStatus(data: StatusData, tx: Prisma.TransactionClient) {
    const current = await tx.helpTicket.findUniqueOrThrow({
      where: { id: data.ticketId },
    });

    const updateData: {
      status: HelpTicketStatus;
      resolvedAt?: Date | null;
      closedAt?: Date | null;
    } = { status: data.status };

    if (data.status === HelpTicketStatus.RESOLVED) {
      updateData.resolvedAt = new Date();
      updateData.closedAt = null;
    }

    if (data.status === HelpTicketStatus.CLOSED) {
      updateData.closedAt = new Date();
    }

    if (
      data.status === HelpTicketStatus.OPEN ||
      data.status === HelpTicketStatus.IN_PROGRESS ||
      data.status === HelpTicketStatus.PENDING
    ) {
      updateData.resolvedAt = null;
      updateData.closedAt = null;
    }

    const ticket = await tx.helpTicket.update({
      where: { id: data.ticketId },
      data: updateData,
    });

    await tx.helpTicketEvent.create({
      data: {
        ticketId: ticket.id,
        event: HelpTicketEventType.STATUS_CHANGED,
        actorUserId: data.actorUserId,
        previousStatus: current.status,
        newStatus: data.status,
        note: data.note ?? null,
      },
    });

    return tx.helpTicket.findUniqueOrThrow({
      where: { id: ticket.id },
      include: ticketInclude,
    });
  }

  delete(id: string) {
    return this.prisma.helpTicket.delete({
      where: { id },
    });
  }

  deleteMany(ids: string[]) {
    return this.prisma.helpTicket.deleteMany({
      where: {
        id: { in: ids },
        deletedAt: null,
      },
    });
  }

  updatePriority(data: PriorityData) {
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.helpTicket.findUniqueOrThrow({
        where: { id: data.ticketId },
      });

      const ticket = await tx.helpTicket.update({
        where: { id: data.ticketId },
        data: { priority: data.priority },
      });

      await tx.helpTicketEvent.create({
        data: {
          ticketId: ticket.id,
          event: HelpTicketEventType.PRIORITY_CHANGED,
          actorUserId: data.actorUserId,
          previousPriority: current.priority,
          newPriority: data.priority,
        },
      });

      return tx.helpTicket.findUniqueOrThrow({
        where: { id: ticket.id },
        include: ticketInclude,
      });
    });
  }
}
