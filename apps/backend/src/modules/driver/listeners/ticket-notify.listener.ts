import { Inject, Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { HelpTicketOwnerType } from "@prisma/client";
import { TICKET_EVENT } from "../../help-center/constants/ticket.events";
import type { Notify, Reply, StatusUpdated } from "../../help-center/types/ticket.events";
import { replyNotify, statusNotify } from "../../help-center/utils/ticket-notify";
import { NotificationService } from "../../notification/services/notification.service";
import { RecipientType } from "../../notification/types/notification";

@Injectable()
export class TicketNotifyListener {
  private readonly logger = new Logger(TicketNotifyListener.name);

  constructor(@Inject(NotificationService) private readonly notifications: NotificationService) {}

  @OnEvent(TICKET_EVENT.REPLIED)
  onReply(payload: Reply) {
    if (payload.ownerType !== HelpTicketOwnerType.DRIVER) return;
    return this.send(payload.ownerId, replyNotify(payload), payload.ticketId);
  }

  @OnEvent(TICKET_EVENT.STATUS_UPDATED)
  onStatus(payload: StatusUpdated) {
    if (payload.ownerType !== HelpTicketOwnerType.DRIVER) return;
    return this.send(payload.ownerId, statusNotify(payload), payload.ticketId);
  }

  private async send(driverId: string, input: Notify, ticketId: string) {
    try {
      await this.notifications.notify({
        recipientType: RecipientType.DRIVER,
        recipientId: driverId,
        type: input.type,
        title: input.title,
        body: input.body,
        data: input.data,
        push: input.push,
      });
    } catch (error) {
      this.logger.error(
        `Failed to notify driver for ticket ${ticketId}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}
