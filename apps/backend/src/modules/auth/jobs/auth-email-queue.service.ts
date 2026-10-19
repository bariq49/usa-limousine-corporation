import { Inject, Injectable, forwardRef } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Job } from "bullmq";
import { AppLogger } from "../../../common/logger/app.logger";
import type { PasswordReset } from "../../../infrastructure/email/types/password-reset";
import type { Verification } from "../../../infrastructure/email/types/verification";
import { BaseQueueService } from "../../../infrastructure/queue/base-queue.service";
import { QueueRegistry } from "../../../infrastructure/queue/queue-registry";
import { AUTH_JOB_NAMES, AUTH_QUEUE_NAME } from "../constants/auth.constants";
import { AuthEmailService } from "../services/auth-email.service";
import type { SmsPayload } from "../types/auth-email.jobs";

@Injectable()
export class AuthEmailQueueService extends BaseQueueService {
  constructor(
    @Inject(ConfigService) configService: ConfigService,
    @Inject(AppLogger) logger: AppLogger,
    @Inject(QueueRegistry) registry: QueueRegistry,
    @Inject(forwardRef(() => AuthEmailService))
    private readonly authEmails: AuthEmailService,
  ) {
    super(configService, logger, registry);
  }

  protected getQueueName() {
    return AUTH_QUEUE_NAME;
  }

  protected getQueueLabel() {
    return "Auth email queue";
  }

  protected async processJob(job: Job) {
    if (job.name === AUTH_JOB_NAMES.SEND_VERIFICATION_EMAIL) {
      await this.authEmails.deliverVerification(job.data as Verification);
    }
    if (job.name === AUTH_JOB_NAMES.SEND_PASSWORD_RESET_EMAIL) {
      await this.authEmails.deliverPasswordReset(job.data as PasswordReset);
    }
    if (job.name === AUTH_JOB_NAMES.SEND_VERIFICATION_SMS) {
      await this.authEmails.deliverVerificationSms(job.data as SmsPayload);
    }
    if (job.name === AUTH_JOB_NAMES.SEND_PASSWORD_RESET_SMS) {
      await this.authEmails.deliverPasswordResetSms(job.data as SmsPayload);
    }
  }

  enqueueVerification(payload: Verification) {
    return this.addJob(AUTH_JOB_NAMES.SEND_VERIFICATION_EMAIL, payload);
  }

  enqueuePasswordReset(payload: PasswordReset) {
    return this.addJob(AUTH_JOB_NAMES.SEND_PASSWORD_RESET_EMAIL, payload);
  }

  enqueueVerificationSms(payload: SmsPayload) {
    return this.addJob(AUTH_JOB_NAMES.SEND_VERIFICATION_SMS, payload);
  }

  enqueuePasswordResetSms(payload: SmsPayload) {
    return this.addJob(AUTH_JOB_NAMES.SEND_PASSWORD_RESET_SMS, payload);
  }
}
