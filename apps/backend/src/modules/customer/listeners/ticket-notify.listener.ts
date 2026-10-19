import { Inject, Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { HelpTicketOwnerType } from "@prisma/client";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { TICKET_EVENT } from "../../help-center/constants/ticket.events";
import type { Notify, Reply, StatusUpdated } from "../../help-center/types/ticket.events";
import { replyNotify, statusNotify } from "../../help-center/utils/ticket-notify";
import { NotificationService } from "../../notification/services/notification.service";
import { RecipientType } from "../../notification/types/notification";

@Injectable()
export class TicketNotifyListener {
  private readonly logger = new Logger(TicketNotifyListener.name);

  constructor(
    @Inject(NotificationService) private readonly notifications: NotificationService,
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  @OnEvent(TICKET_EVENT.REPLIED)
  onReply(payload: Reply) {
    if (payload.ownerType !== HelpTicketOwnerType.CUSTOMER) return;
    return this.send(payload.ownerId, replyNotify(payload), payload.ticketId);
  }

  @OnEvent(TICKET_EVENT.STATUS_UPDATED)
  onStatus(payload: StatusUpdated) {
    if (payload.ownerType !== HelpTicketOwnerType.CUSTOMER) return;
    return this.send(payload.ownerId, statusNotify(payload), payload.ticketId);
  }

  private async send(customerId: string, input: Notify, ticketId: string) {
    try {
      const customer = await this.prisma.customer.findUnique({
        where: { id: customerId },
        select: { userId: true },
      });
      if (!customer) return;

      await this.notifications.notify({
        recipientType: RecipientType.USER,
        recipientId: customer.userId,
        type: input.type,
        title: input.title,
        body: input.body,
        data: input.data,
        push: input.push,
      });
    } catch (error) {
      this.logger.error(
        `Failed to notify customer for ticket ${ticketId}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}
