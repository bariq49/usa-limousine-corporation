import { Inject, Injectable, forwardRef } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OnEvent } from "@nestjs/event-emitter";
import { HelpTicketPriority, HelpTicketSource } from "@prisma/client";
import { PLATFORM } from "@usa-limousine-corporation/config";
import { AppLogger } from "../../../common/logger/app.logger";
import { getEmailConfig } from "../../../infrastructure/email/email.config";
import { EmailService } from "../../../infrastructure/email/email.service";
import {
  ticketCreatedAdmin,
  ticketCreatedUser,
} from "../../../infrastructure/email/templates/help-center/created";
import { ticketPriorityRaised } from "../../../infrastructure/email/templates/help-center/priority-raised";
import { ticketReplied } from "../../../infrastructure/email/templates/help-center/replied";
import type { TicketMailView } from "../../../infrastructure/email/types/help-center";
import { TICKET_EVENT } from "../constants/ticket.events";
import { TicketEmailQueueService } from "../jobs/ticket-email-queue.service";
import { TicketRepository } from "../repositories/ticket.repository";
import type { Created, PriorityUpdated, Reply, TicketEmailJob } from "../types/ticket.events";

const CATEGORY_LABELS: Record<string, string> = {
  ACCOUNT: "Account",
  BOOKING: "Booking",
  PAYMENTS: "Payments",
  APP: "App",
  OTHER: "General",
};

@Injectable()
export class TicketEmailService {
  constructor(
    @Inject(TicketRepository) private readonly tickets: TicketRepository,
    @Inject(EmailService) private readonly emailService: EmailService,
    @Inject(ConfigService) private readonly configService: ConfigService,
    @Inject(forwardRef(() => TicketEmailQueueService))
    private readonly emailQueue: TicketEmailQueueService,
    @Inject(AppLogger) private readonly logger: AppLogger,
  ) {}

  @OnEvent(TICKET_EVENT.CREATED)
  onCreated(payload: Created) {
    return this.enqueue({ kind: "created", ticketId: payload.ticketId });
  }

  @OnEvent(TICKET_EVENT.REPLIED)
  onReplied(payload: Reply) {
    if (!payload.fromStaff) return undefined;
    return this.enqueue({
      kind: "replied",
      ticketId: payload.ticketId,
      messageId: payload.messageId,
    });
  }

  @OnEvent(TICKET_EVENT.PRIORITY_UPDATED)
  onPriorityUpdated(payload: PriorityUpdated) {
    if (payload.to !== HelpTicketPriority.HIGH) return undefined;
    return this.enqueue({ kind: "priority", ticketId: payload.ticketId });
  }

  async enqueue(job: TicketEmailJob) {
    try {
      await this.emailQueue.enqueueTicketEmail(job);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      this.logger.error(
        `Ticket ${job.kind} email enqueue failed for ${job.ticketId}: ${message}`,
        undefined,
        TicketEmailService.name,
      );
    }
  }

  async deliver(job: TicketEmailJob) {
    const ticket = await this.tickets.findContact(job.ticketId);
    if (!ticket) return;

    const user = ticket.customer?.user;
    const userName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");
    const email = ticket.contactEmail ?? user?.email;
    if (!email) return;

    const siteUrl = this.configService.getOrThrow<string>("WEBSITE_URL").replace(/\/+$/, "");
    const adminEmail = getEmailConfig(this.configService).defaultAdminEmail;
    const view: TicketMailView = {
      ticketNumber: ticket.ticketNumber,
      subject: ticket.subject,
      description: ticket.description,
      category: CATEGORY_LABELS[ticket.category] ?? ticket.category,
      priority: ticket.priority,
      contactName: ticket.contactName ?? (userName || email),
      contactEmail: email,
      contactPhone: ticket.contactPhone ?? user?.phone ?? null,
    };
    const canEmailUser =
      ticket.source === HelpTicketSource.WEBSITE || ticket.customer?.settings?.email !== false;
    const userReplyTo = adminEmail ?? PLATFORM.contact.email;

    if (job.kind === "created") {
      if (canEmailUser) {
        await this.emailService.send({
          to: email,
          replyTo: userReplyTo,
          subject: `We received your message · ${ticket.ticketNumber} - ${PLATFORM.shortName}`,
          html: ticketCreatedUser({ siteUrl, ticket: view }),
        });
      }
      if (adminEmail) {
        await this.emailService.send({
          to: adminEmail,
          replyTo: email,
          subject: `${ticket.priority === HelpTicketPriority.HIGH ? "[HIGH PRIORITY] " : ""}New ticket ${ticket.ticketNumber}: ${ticket.subject}`,
          html: ticketCreatedAdmin({
            siteUrl,
            ticket: view,
            source: ticket.source === HelpTicketSource.WEBSITE ? "website" : "portal",
          }),
        });
      }
      return;
    }

    if (job.kind === "replied") {
      const message = job.messageId ? await this.tickets.findMessage(job.messageId) : null;
      if (!message || !canEmailUser) return;
      await this.emailService.send({
        to: email,
        replyTo: userReplyTo,
        subject: `Reply to your request · ${ticket.ticketNumber} - ${PLATFORM.shortName}`,
        html: ticketReplied({ siteUrl, ticket: view, reply: message.body }),
      });
      return;
    }

    if (adminEmail) {
      await this.emailService.send({
        to: adminEmail,
        replyTo: email,
        subject: `[HIGH PRIORITY] Ticket ${ticket.ticketNumber}: ${ticket.subject}`,
        html: ticketPriorityRaised({ siteUrl, ticket: view }),
      });
    }
  }
}
