import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import {
  HelpTicketCategory,
  HelpTicketPriority,
  HelpTicketSource,
  HelpTicketStatus,
  NotificationType,
  type Prisma,
} from "@prisma/client";
import type { Request } from "express";
import { allocateCode } from "../../../common/utils/allocate-sequence-code";
import { auditLog } from "../../../common/utils/audit-log";
import { requireUserId, toRequestContext } from "../../../common/utils/to-request-context";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { SequenceService } from "../../../infrastructure/sequence/sequence.service";
import { NotificationService } from "../../notification/services/notification.service";
import { RecipientType } from "../../notification/types/notification";
import { TICKET_EVENT } from "../constants/ticket.events";
import type { PriorityDto, QueryDto, ReplyDto, StatusDto } from "../dto/ticket.dto";
import { TicketRepository } from "../repositories/ticket.repository";
import type { Create, CreateData, WebsiteCreate } from "../types/ticket";
import type { Created, PriorityUpdated, Reply, StatusUpdated } from "../types/ticket.events";
import { replyNotify, statusNotify } from "../utils/ticket-notify";

@Injectable()
export class TicketService {
  constructor(
    @Inject(TicketRepository) private readonly tickets: TicketRepository,
    @Inject(SequenceService) private readonly sequenceService: SequenceService,
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(EventEmitter2) private readonly events: EventEmitter2,
    @Inject(NotificationService) private readonly notificationService: NotificationService,
  ) {}

  async create(input: Create, request: Request) {
    const context = toRequestContext(request);
    const actorUserId = requireUserId(context);

    const ticketNumber = await allocateCode({
      prefix: "HC",
      nextSequence: () => this.sequenceService.nextHelpTicket(),
    });

    const created = await this.prisma.$transaction(async (tx) => {
      const ticket = await this.tickets.create(
        {
          ticketNumber,
          customerId: input.customerId,
          source: HelpTicketSource.PORTAL,
          contactName: null,
          contactEmail: null,
          contactPhone: null,
          subject: input.subject,
          description: input.description,
          attachment: input.attachment ?? null,
          category: input.category ?? HelpTicketCategory.OTHER,
          priority: input.priority ?? HelpTicketPriority.MEDIUM,
          actorUserId,
        },
        tx,
      );

      const notifications = await this.notificationService.stageForAdmins(
        {
          type: NotificationType.TICKET_CREATED,
          title: "New support ticket",
          body: `${ticket.ticketNumber}: ${ticket.subject}`,
          data: {
            type: "TICKET_CREATED",
            ticketId: ticket.id,
            ticketNumber: ticket.ticketNumber,
            customerId: ticket.customerId,
          },
          excludeUserId: actorUserId,
          idempotencyKey: `TICKET_CREATED:${ticket.id}`,
        },
        tx,
      );

      return { ticket, notifications };
    });
    const ticket = created.ticket;
    await this.notificationService.deliverStaged(created.notifications);

    await auditLog({
      prisma: this.prisma,
      event: TICKET_EVENT.CREATED,
      result: "success",
      context,
      userId: context.userId,
      metadata: {
        ticketId: ticket.id,
        ticketNumber: ticket.ticketNumber,
        customerId: input.customerId,
      },
    });

    const payload: Created = {
      customerId: input.customerId,
      actorUserId,
      ticketId: ticket.id,
      ticketNumber: ticket.ticketNumber,
      subject: ticket.subject,
      category: ticket.category,
      status: ticket.status,
      priority: ticket.priority,
    };
    this.events.emit(TICKET_EVENT.CREATED, payload);

    return ticket;
  }

  async createFromWebsite(input: WebsiteCreate, request: Request) {
    const context = toRequestContext(request);
    const customer = await this.tickets.findCustomerIdByEmail(input.email);
    const ticketNumber = await allocateCode({
      prefix: "HC",
      nextSequence: () => this.sequenceService.nextHelpTicket(),
    });
    const data: CreateData = {
      ticketNumber,
      customerId: customer?.id ?? null,
      source: HelpTicketSource.WEBSITE,
      contactName: input.name,
      contactEmail: input.email,
      contactPhone: input.phone,
      subject: input.subject,
      description: input.description,
      attachment: null,
      category: input.category,
      priority: input.priority,
      actorUserId: customer?.userId ?? null,
    };
    const isHigh = input.priority === HelpTicketPriority.HIGH;

    const created = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const ticket = await this.tickets.create(data, tx);
      const notifications = await this.notificationService.stageForAdmins(
        {
          type: NotificationType.TICKET_CREATED,
          title: isHigh ? "High priority enquiry" : "New website enquiry",
          body: `${ticket.ticketNumber}: ${ticket.subject} (${input.name})`,
          data: {
            type: "TICKET_CREATED",
            ticketId: ticket.id,
            ticketNumber: ticket.ticketNumber,
            customerId: ticket.customerId,
            source: HelpTicketSource.WEBSITE,
          },
          idempotencyKey: `TICKET_CREATED:${ticket.id}`,
        },
        tx,
      );
      return { ticket, notifications };
    });
    const ticket = created.ticket;
    await this.notificationService.deliverStaged(created.notifications);

    await auditLog({
      prisma: this.prisma,
      event: TICKET_EVENT.CREATED,
      result: "success",
      context,
      metadata: {
        ticketId: ticket.id,
        ticketNumber: ticket.ticketNumber,
        source: HelpTicketSource.WEBSITE,
        customerId: ticket.customerId,
      },
    });

    const payload: Created = {
      customerId: ticket.customerId,
      actorUserId: null,
      ticketId: ticket.id,
      ticketNumber: ticket.ticketNumber,
      subject: ticket.subject,
      category: ticket.category,
      status: ticket.status,
      priority: ticket.priority,
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

    // Message (+ first-reply status change) and the customer notification commit together.
    const replied = await this.prisma.$transaction(async (tx) => {
      const message = await this.tickets.addMessage(
        { ticketId: ticket.id, authorUserId: actorUserId, body: body.body },
        tx,
      );

      if (ticket.status === HelpTicketStatus.PENDING) {
        await this.tickets.updateStatus(
          {
            ticketId: ticket.id,
            status: HelpTicketStatus.OPEN,
            actorUserId,
            note: "First staff reply",
          },
          tx,
        );
      }

      const payload: Reply = {
        customerId: ticket.customerId,
        actorUserId,
        ticketId: ticket.id,
        ticketNumber: ticket.ticketNumber,
        subject: ticket.subject,
        messageId: message.id,
        fromStaff: true,
      };
      const owner = ticket.customerId
        ? await tx.customer.findUnique({
            where: { id: ticket.customerId },
            select: { userId: true, settings: { select: { notification: true } } },
          })
        : null;
      // Customers who turned off notifications get no notification row (and so no push).
      const wantsNotification = owner !== null && owner.settings?.notification !== false;
      const notify = replyNotify(payload);
      const notifications = wantsNotification
        ? await this.notificationService.stage(
            [
              {
                recipientType: RecipientType.USER,
                recipientId: owner.userId,
                type: notify.type,
                title: notify.title,
                body: notify.body,
                data: notify.data,
                push: notify.push,
                idempotencyKey: `TICKET_REPLY:${message.id}`,
              },
            ],
            tx,
          )
        : [];

      return { message, payload, notifications };
    });
    const message = replied.message;
    await this.notificationService.deliverStaged(replied.notifications);

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

    this.events.emit(TICKET_EVENT.REPLIED, replied.payload);

    return this.getOne(id);
  }

  /** Customer reply on their own ticket; admins get a live notification in the same transaction. */
  async customerReply(id: string, body: ReplyDto, request: Request) {
    const context = toRequestContext(request);
    const actorUserId = requireUserId(context);
    const ticket = await this.getOne(id);

    if (ticket.status === HelpTicketStatus.RESOLVED || ticket.status === HelpTicketStatus.CLOSED) {
      throw new BadRequestException(`Cannot reply to a ${ticket.status.toLowerCase()} ticket`);
    }

    const replied = await this.prisma.$transaction(async (tx) => {
      const message = await this.tickets.addMessage(
        { ticketId: ticket.id, authorUserId: actorUserId, body: body.body },
        tx,
      );

      const notifications = await this.notificationService.stageForAdmins(
        {
          type: NotificationType.TICKET_REPLY,
          title: "Customer replied",
          body: `${ticket.ticketNumber}: ${body.body.slice(0, 120)}`,
          data: {
            type: "TICKET_REPLY",
            ticketId: ticket.id,
            ticketNumber: ticket.ticketNumber,
            messageId: message.id,
          },
          excludeUserId: actorUserId,
          idempotencyKey: `TICKET_CUSTOMER_REPLY:${message.id}`,
        },
        tx,
      );

      const payload: Reply = {
        customerId: ticket.customerId,
        actorUserId,
        ticketId: ticket.id,
        ticketNumber: ticket.ticketNumber,
        subject: ticket.subject,
        messageId: message.id,
        fromStaff: false,
      };

      return { message, payload, notifications };
    });
    await this.notificationService.deliverStaged(replied.notifications);

    await auditLog({
      prisma: this.prisma,
      event: TICKET_EVENT.REPLIED,
      result: "success",
      context,
      userId: context.userId,
      metadata: {
        ticketId: ticket.id,
        messageId: replied.message.id,
        role: "customer",
      },
    });

    this.events.emit(TICKET_EVENT.REPLIED, replied.payload);

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

    const payload: StatusUpdated = {
      customerId: ticket.customerId,
      actorUserId,
      ticketId: ticket.id,
      ticketNumber: ticket.ticketNumber,
      subject: ticket.subject,
      from: ticket.status,
      to: body.status,
      note: body.note ?? null,
    };

    // Status change and the customer notification commit together.
    const changed = await this.prisma.$transaction(async (tx) => {
      const updated = await this.tickets.updateStatus(
        { ticketId: ticket.id, status: body.status, actorUserId, note: body.note },
        tx,
      );
      const owner = ticket.customerId
        ? await tx.customer.findUnique({
            where: { id: ticket.customerId },
            select: { userId: true, settings: { select: { notification: true } } },
          })
        : null;
      // Customers who turned off notifications get no notification row (and so no push).
      const wantsNotification = owner !== null && owner.settings?.notification !== false;
      const notify = statusNotify(payload);
      const notifications = wantsNotification
        ? await this.notificationService.stage(
            [
              {
                recipientType: RecipientType.USER,
                recipientId: owner.userId,
                type: notify.type,
                title: notify.title,
                body: notify.body,
                data: notify.data,
                push: notify.push,
                idempotencyKey: `TICKET_STATUS:${ticket.id}:${updated.updatedAt.getTime()}`,
              },
            ],
            tx,
          )
        : [];
      return { updated, notifications };
    });
    const updated = changed.updated;
    await this.notificationService.deliverStaged(changed.notifications);

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

    this.events.emit(TICKET_EVENT.STATUS_UPDATED, payload);

    return updated;
  }

  async updatePriority(id: string, body: PriorityDto, request: Request) {
    const context = toRequestContext(request);
    const ticket = await this.getOne(id);

    if (ticket.priority === body.priority) {
      throw new BadRequestException(`Ticket priority is already ${ticket.priority}`);
    }

    const actorUserId = requireUserId(context);
    const updated = await this.tickets.updatePriority({
      ticketId: id,
      priority: body.priority,
      actorUserId,
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

    const payload: PriorityUpdated = {
      customerId: ticket.customerId,
      actorUserId,
      ticketId: ticket.id,
      ticketNumber: ticket.ticketNumber,
      subject: ticket.subject,
      from: ticket.priority,
      to: body.priority,
    };
    this.events.emit(TICKET_EVENT.PRIORITY_UPDATED, payload);

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
