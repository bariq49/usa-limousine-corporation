import { Inject, Injectable, forwardRef } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Job } from "bullmq";
import { AppLogger } from "../../../common/logger/app.logger";
import { BaseQueueService } from "../../../infrastructure/queue/base-queue.service";
import { QueueRegistry } from "../../../infrastructure/queue/queue-registry";
import { TICKET_JOB_NAMES, TICKET_QUEUE_NAME } from "../constants/ticket.constants";
import { TicketEmailService } from "../services/ticket-email.service";
import type { TicketEmailJob } from "../types/ticket.events";

@Injectable()
export class TicketEmailQueueService extends BaseQueueService {
  constructor(
    @Inject(ConfigService) configService: ConfigService,
    @Inject(AppLogger) logger: AppLogger,
    @Inject(QueueRegistry) registry: QueueRegistry,
    @Inject(forwardRef(() => TicketEmailService))
    private readonly emails: TicketEmailService,
  ) {
    super(configService, logger, registry);
  }

  protected getQueueName() {
    return TICKET_QUEUE_NAME;
  }

  protected getQueueLabel() {
    return "Help center email queue";
  }

  protected async processJob(job: Job) {
    if (job.name === TICKET_JOB_NAMES.SEND_TICKET_EMAIL) {
      await this.emails.deliver(job.data as TicketEmailJob);
    }
  }

  enqueueTicketEmail(payload: TicketEmailJob) {
    return this.addJob(TICKET_JOB_NAMES.SEND_TICKET_EMAIL, payload);
  }
}
