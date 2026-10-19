import { Inject, Injectable, forwardRef } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { getEmailConfig } from "../../../infrastructure/email/email.config";
import { EmailService } from "../../../infrastructure/email/email.service";
import type { ApplicationStatus } from "../../../infrastructure/email/types/application-status";
import type { Credentials } from "../../../infrastructure/email/types/credentials";
import { DriverEmailQueueService } from "../jobs/driver-email-queue.service";
import type {
  SendApplicationReceivedEmails,
  SendApplicationStatusEmail,
  SendDriverCredentialsEmail,
} from "../types/driver-email.jobs";

@Injectable()
export class DriverEmailService {
  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService,
    @Inject(EmailService) private readonly emailService: EmailService,
    @Inject(forwardRef(() => DriverEmailQueueService))
    private readonly queue: DriverEmailQueueService,
  ) {}

  async sendApplicationStatusEmail(params: SendApplicationStatusEmail) {
    const payload: ApplicationStatus = {
      to: params.email,
      status: params.status,
    };
    if (params.reason !== undefined) {
      payload.reason = params.reason;
    }
    await this.queue.enqueueApplicationStatus(payload);
  }

  async sendDriverCredentialsEmail(params: SendDriverCredentialsEmail) {
    await this.queue.enqueueCredentials(params);
  }

  async sendApplicationReceivedEmails(params: SendApplicationReceivedEmails) {
    const adminEmail =
      params.adminEmail?.trim() || getEmailConfig(this.configService).defaultAdminEmail;

    const payload: SendApplicationReceivedEmails = {
      driverEmail: params.driverEmail,
      applicationNumber: params.applicationNumber,
      firstName: params.firstName,
      lastName: params.lastName,
      email: params.email,
    };
    if (params.phone !== undefined) {
      payload.phone = params.phone;
    }
    if (params.homeAddress !== undefined) {
      payload.homeAddress = params.homeAddress;
    }
    if (params.shift !== undefined) {
      payload.shift = params.shift;
    }
    if (params.startTime !== undefined) {
      payload.startTime = params.startTime;
    }
    if (params.endTime !== undefined) {
      payload.endTime = params.endTime;
    }
    if (params.operatingCountry !== undefined) {
      payload.operatingCountry = params.operatingCountry;
    }
    if (params.operatingCity !== undefined) {
      payload.operatingCity = params.operatingCity;
    }
    if (params.vehicleSummary !== undefined) {
      payload.vehicleSummary = params.vehicleSummary;
    }
    if (adminEmail) {
      payload.adminEmail = adminEmail;
    }

    await this.queue.enqueueApplicationReceived(payload);
  }

  async deliverApplicationStatus(payload: ApplicationStatus) {
    await this.emailService.sendDriverApplicationStatusEmail(payload);
  }

  async deliverCredentials(data: SendDriverCredentialsEmail) {
    const payload: Credentials = {
      to: data.email,
      email: data.email,
      password: data.password,
    };
    await this.emailService.sendDriverCredentialsEmail(payload);
  }

  async deliverApplicationReceived(data: SendApplicationReceivedEmails) {
    const { driverEmail, adminEmail, ...application } = data;

    await this.emailService.sendDriverApplicationReceivedEmail({
      to: driverEmail,
      ...application,
    });
    if (adminEmail) {
      await this.emailService.sendAdminNewDriverApplicationEmail({
        to: adminEmail,
        ...application,
      });
    }
  }
}
