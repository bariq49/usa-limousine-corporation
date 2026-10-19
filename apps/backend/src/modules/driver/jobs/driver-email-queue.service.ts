import { Inject, Injectable, forwardRef } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Job } from "bullmq";
import { AppLogger } from "../../../common/logger/app.logger";
import type { ApplicationStatus } from "../../../infrastructure/email/types/application-status";
import { BaseQueueService } from "../../../infrastructure/queue/base-queue.service";
import { QueueRegistry } from "../../../infrastructure/queue/queue-registry";
import { DRIVER_JOB_NAMES, DRIVER_QUEUE_NAME } from "../constants/driver.constants";
import { DriverEmailService } from "../services/driver-email.service";
import type {
  SendApplicationReceivedEmails,
  SendDriverCredentialsEmail,
} from "../types/driver-email.jobs";

@Injectable()
export class DriverEmailQueueService extends BaseQueueService {
  constructor(
    @Inject(ConfigService) configService: ConfigService,
    @Inject(AppLogger) logger: AppLogger,
    @Inject(QueueRegistry) registry: QueueRegistry,
    @Inject(forwardRef(() => DriverEmailService))
    private readonly driverEmails: DriverEmailService,
  ) {
    super(configService, logger, registry);
  }

  protected getQueueName() {
    return DRIVER_QUEUE_NAME;
  }

  protected getQueueLabel() {
    return "Driver email queue";
  }

  protected async processJob(job: Job) {
    if (job.name === DRIVER_JOB_NAMES.SEND_APPLICATION_STATUS_EMAIL) {
      await this.driverEmails.deliverApplicationStatus(job.data as ApplicationStatus);
    }
    if (job.name === DRIVER_JOB_NAMES.SEND_DRIVER_CREDENTIALS_EMAIL) {
      await this.driverEmails.deliverCredentials(job.data as SendDriverCredentialsEmail);
    }
    if (job.name === DRIVER_JOB_NAMES.SEND_APPLICATION_RECEIVED_EMAILS) {
      await this.driverEmails.deliverApplicationReceived(job.data as SendApplicationReceivedEmails);
    }
  }

  enqueueApplicationStatus(payload: ApplicationStatus) {
    return this.addJob(DRIVER_JOB_NAMES.SEND_APPLICATION_STATUS_EMAIL, payload);
  }

  enqueueCredentials(payload: SendDriverCredentialsEmail) {
    return this.addJob(DRIVER_JOB_NAMES.SEND_DRIVER_CREDENTIALS_EMAIL, payload);
  }

  enqueueApplicationReceived(payload: SendApplicationReceivedEmails) {
    return this.addJob(DRIVER_JOB_NAMES.SEND_APPLICATION_RECEIVED_EMAILS, payload);
  }
}
