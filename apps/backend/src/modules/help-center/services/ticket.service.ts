import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { HelpTicketCategory, HelpTicketPriority, HelpTicketStatus } from "@prisma/client";
import type { Request } from "express";
import { auditLog } from "../../../common/utils/audit-log";
import { requireUserId, toRequestContext } from "../../../common/utils/to-request-context";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { SequenceService } from "../../../infrastructure/sequence/sequence.service";
import { TICKET_EVENT } from "../constants/ticket.events";
import type { PriorityDto, QueryDto, ReplyDto, StatusDto } from "../dto/ticket.dto";
import { TicketRepository } from "../repositories/ticket.repository";
import type { Create } from "../types/ticket";
import type { Created, Reply, StatusUpdated } from "../types/ticket.events";

@Injectable()
export class TicketService {
  constructor(
    @Inject(TicketRepository) private readonly tickets: TicketRepository,
    @Inject(SequenceService) private readonly sequenceService: SequenceService,
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(EventEmitter2) private readonly events: EventEmitter2,
  ) {}

  async create(input: Create, request: Request) {
    const context = toRequestContext(request);
    const actorUserId = requireUserId(context);

    const ticketNumber = await this.sequenceService.allocate({
      counterId: "help-ticket",
      prefix: "HC",
    });

    const ticket = await this.tickets.create({
      ticketNumber,
      ownerType: input.ownerType,
      ownerId: input.ownerId,
      ownerName: input.ownerName?.trim() || null,
      ownerEmail: input.ownerEmail?.trim() || null,
      subject: input.subject,
      description: input.description,
      attachment: input.attachment ?? null,
      category: input.category ?? HelpTicketCategory.OTHER,
      priority: input.priority ?? HelpTicketPriority.MEDIUM,
      actorUserId,
    });

    await auditLog({
      prisma: this.prisma,
      event: TICKET_EVENT.CREATED,
      result: "success",
      context,
      userId: context.userId,
      metadata: {
        ticketId: ticket.id,
        ticketNumber: ticket.ticketNumber,
        ownerType: input.ownerType,
        ownerId: input.ownerId,
      },
    });

    const payload: Created = {
      ownerType: input.ownerType,
      ownerId: input.ownerId,
      actorUserId,
      ticketId: ticket.id,
      ticketNumber: ticket.ticketNumber,
      subject: ticket.subject,
      category: ticket.category,
      status: ticket.status,
    };
    this.events.emit(TICKET_EVENT.CREATED, payload);

    return ticket;
  }

  list(query: QueryDto) {
    return this.tickets.findMany(query);
  }

  async getOne(id: string) {
    const ticket = await this.tickets.findById(id);
    if (!ticket) {
      throw new NotFoundException("Help ticket not found");
    }

    return ticket;
  }

  async reply(id: string, body: ReplyDto, request: Request) {
    const context = toRequestContext(request);
    const actorUserId = requireUserId(context);
    const ticket = await this.getOne(id);

    if (ticket.status === HelpTicketStatus.RESOLVED || ticket.status === HelpTicketStatus.CLOSED) {
      throw new BadRequestException(`Cannot reply to a ${ticket.status.toLowerCase()} ticket`);
    }

    const message = await this.tickets.addMessage({
      ticketId: ticket.id,
      authorUserId: actorUserId,
      body: body.body,
    });

    if (ticket.status === HelpTicketStatus.PENDING) {
      await this.tickets.updateStatus({
        ticketId: ticket.id,
        status: HelpTicketStatus.OPEN,
        actorUserId,
        note: "First staff reply",
      });
    }

    await auditLog({
      prisma: this.prisma,
      event: TICKET_EVENT.REPLIED,
      result: "success",
      context,
      userId: context.userId,
      metadata: {
        ticketId: ticket.id,
        messageId: message.id,
        role: "admin",
      },
    });

    const payload: Reply = {
      ownerType: ticket.ownerType,
      ownerId: ticket.ownerId,
      actorUserId,
      ticketId: ticket.id,
      ticketNumber: ticket.ticketNumber,
      subject: ticket.subject,
      messageId: message.id,
    };
    this.events.emit(TICKET_EVENT.REPLIED, payload);

    return this.getOne(id);
  }

  async updateStatus(id: string, body: StatusDto, request: Request) {
    const context = toRequestContext(request);
    const actorUserId = requireUserId(context);
    const ticket = await this.getOne(id);

    if (ticket.status === body.status) {
      throw new BadRequestException(`Ticket is already ${ticket.status}`);
    }

    this.assertCanTransition(ticket.status, body.status);

    const updated = await this.tickets.updateStatus({
      ticketId: ticket.id,
      status: body.status,
      actorUserId,
      note: body.note,
    });

    await auditLog({
      prisma: this.prisma,
      event: TICKET_EVENT.STATUS_UPDATED,
      result: "success",
      context,
      userId: context.userId,
      metadata: {
        ticketId: ticket.id,
        from: ticket.status,
        to: body.status,
      },
    });

    const payload: StatusUpdated = {
      ownerType: ticket.ownerType,
      ownerId: ticket.ownerId,
      actorUserId,
      ticketId: ticket.id,
      ticketNumber: ticket.ticketNumber,
      subject: ticket.subject,
      from: ticket.status,
      to: body.status,
      note: body.note ?? null,
    };
    this.events.emit(TICKET_EVENT.STATUS_UPDATED, payload);

    return updated;
  }

  async updatePriority(id: string, body: PriorityDto, request: Request) {
    const context = toRequestContext(request);
    const ticket = await this.getOne(id);

    if (ticket.priority === body.priority) {
      throw new BadRequestException(`Ticket priority is already ${ticket.priority}`);
    }

    const updated = await this.tickets.updatePriority({
      ticketId: id,
      priority: body.priority,
      actorUserId: requireUserId(context),
    });

    await auditLog({
      prisma: this.prisma,
      event: "help_center.ticket_priority_updated",
      result: "success",
      context,
      userId: context.userId,
      metadata: {
        ticketId: id,
        from: ticket.priority,
        to: body.priority,
      },
    });

    return updated;
  }

  async remove(id: string, request: Request) {
    const context = toRequestContext(request);
    const ticket = await this.getOne(id);
    const deleted = await this.tickets.delete(ticket.id);

    await auditLog({
      prisma: this.prisma,
      event: "help_center.ticket_deleted",
      result: "success",
      context,
      userId: context.userId,
      metadata: {
        ticketId: deleted.id,
        ticketNumber: deleted.ticketNumber,
      },
    });

    return deleted;
  }

  async bulkRemove(ids: string[], request: Request) {
    const context = toRequestContext(request);
    const result = await this.tickets.deleteMany(ids);

    await auditLog({
      prisma: this.prisma,
      event: "help_center.ticket_bulk_deleted",
      result: "success",
      context,
      userId: context.userId,
      metadata: { count: result.count, ids },
    });

    return { success: true, count: result.count };
  }

  private assertCanTransition(current: HelpTicketStatus, next: HelpTicketStatus) {
    const allowed = this.allowedTransitions(current);
    if (!allowed.includes(next)) {
      throw new BadRequestException(`Cannot transition ticket from ${current} to ${next}`);
    }
  }
  private allowedTransitions(current: HelpTicketStatus): HelpTicketStatus[] {
    switch (current) {
      case HelpTicketStatus.PENDING:
        return [HelpTicketStatus.OPEN];
      case HelpTicketStatus.OPEN:
        return [HelpTicketStatus.IN_PROGRESS];
      case HelpTicketStatus.IN_PROGRESS:
        return [HelpTicketStatus.RESOLVED];
      case HelpTicketStatus.RESOLVED:
        return [HelpTicketStatus.CLOSED, HelpTicketStatus.IN_PROGRESS];
      case HelpTicketStatus.CLOSED:
        return [];
      default:
        return [];
    }
  }
}
