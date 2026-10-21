import { Inject, Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { ACTIVITY_TYPE } from "../../activity/constants/activity.constants";
import { ActivityService } from "../../activity/services/activity.service";
import { TICKET_EVENT } from "../constants/ticket.events";
import type { Created, Reply, StatusUpdated } from "../types/ticket.events";

@Injectable()
export class TicketActivityListener {
  private readonly logger = new Logger(TicketActivityListener.name);

  constructor(@Inject(ActivityService) private readonly activities: ActivityService) {}

  @OnEvent(TICKET_EVENT.CREATED)
  async onCreated(payload: Created) {
    try {
      await this.activities.record({
        customerId: payload.customerId,
        type: ACTIVITY_TYPE.TICKET_CREATED,
        actorUserId: payload.actorUserId,
        data: {
          ticketId: payload.ticketId,
          ticketNumber: payload.ticketNumber,
          subject: payload.subject,
          category: payload.category,
          status: payload.status,
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to record activity for ticket ${payload.ticketId}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  @OnEvent(TICKET_EVENT.REPLIED)
  async onReplied(payload: Reply) {
    try {
      await this.activities.record({
        customerId: payload.customerId,
        type: ACTIVITY_TYPE.TICKET_REPLIED,
        actorUserId: payload.actorUserId,
        data: {
          ticketId: payload.ticketId,
          ticketNumber: payload.ticketNumber,
          subject: payload.subject,
          messageId: payload.messageId,
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to record reply activity for ticket ${payload.ticketId}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  @OnEvent(TICKET_EVENT.STATUS_UPDATED)
  async onStatusUpdated(payload: StatusUpdated) {
    try {
      await this.activities.record({
        customerId: payload.customerId,
        type: ACTIVITY_TYPE.TICKET_STATUS_UPDATED,
        actorUserId: payload.actorUserId,
        data: {
          ticketId: payload.ticketId,
          ticketNumber: payload.ticketNumber,
          subject: payload.subject,
          from: payload.from,
          to: payload.to,
          note: payload.note ?? null,
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to record status activity for ticket ${payload.ticketId}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}
