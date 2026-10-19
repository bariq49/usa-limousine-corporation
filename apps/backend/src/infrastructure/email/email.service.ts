import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppLogger } from "../../common/logger/app.logger";
import { getEmailConfig } from "./email.config";
import { NodemailerEmailProvider } from "./providers/nodemailer.provider";
import { adminApplicationReceived, applicationReceived } from "./templates/application-received";
import { applicationStatus } from "./templates/application-status";
import { credentials } from "./templates/credentials";
import { passwordReset } from "./templates/password-reset";
import { verification } from "./templates/verification";
import type { AdminApplicationReceived, ApplicationReceived } from "./types/application-received";
import type { ApplicationStatus } from "./types/application-status";
import type { Credentials } from "./types/credentials";
import type { SendMailOptions } from "./types/mail";
import type { PasswordReset } from "./types/password-reset";
import type { Verification } from "./types/verification";

@Injectable()
export class EmailService {
  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService,
    @Inject(NodemailerEmailProvider) private readonly provider: NodemailerEmailProvider,
    @Inject(AppLogger) private readonly logger: AppLogger,
  ) {}

  isConfigured(): boolean {
    return true;
  }

  async send(options: SendMailOptions) {
    const { to, subject, html, text, cc, bcc, replyTo, attachments } = options;
    const config = getEmailConfig(this.configService);

    const payload: SendMailOptions & { from: string } = {
      to,
      subject,
      from: config.from,
    };

    if (html !== undefined) {
      payload.html = html;
    }
    if (text !== undefined) {
      payload.text = text;
    }
    if (cc !== undefined) {
      payload.cc = cc;
    }
    if (bcc !== undefined) {
      payload.bcc = bcc;
    }
    if (replyTo !== undefined) {
      payload.replyTo = replyTo;
    }
    if (attachments !== undefined) {
      payload.attachments = attachments;
    }

    try {
      const result = await this.provider.send(payload);
      this.logger.log(`Email queued for delivery (${result.messageId})`, EmailService.name);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown email error";
      this.logger.error(`Email send failed: ${message}`, undefined, EmailService.name);
      throw error;
    }
  }

  async verify() {
    return this.provider.verify();
  }

  async sendVerificationEmail(params: Verification) {
    await this.send({
      to: params.to,
      subject: "Verify your USA Limousine Corporation email address",
      html: verification(params),
    });
  }

  async sendPasswordResetEmail(params: PasswordReset) {
    await this.send({
      to: params.to,
      subject: "Reset your USA Limousine Corporation password",
      html: passwordReset(params),
    });
  }

  async sendDriverApplicationStatusEmail(params: ApplicationStatus) {
    const subjects = {
      UNDER_REVIEW: "Your USA Limousine Corporation driver application is under review",
      APPROVED: "Your USA Limousine Corporation driver application is approved",
      REJECTED: "Your USA Limousine Corporation driver application was rejected",
    } as const;

    await this.send({
      to: params.to,
      subject: subjects[params.status],
      html: applicationStatus(params),
    });
  }

  async sendDriverCredentialsEmail(params: Credentials) {
    await this.send({
      to: params.to,
      subject: "Your USA Limousine Corporation driver login credentials",
      html: credentials(params),
    });
  }

  async sendDriverApplicationReceivedEmail(params: ApplicationReceived) {
    await this.send({
      to: params.to,
      subject: "We received your USA Limousine Corporation driver application",
      html: applicationReceived(params),
    });
  }

  async sendAdminNewDriverApplicationEmail(params: AdminApplicationReceived) {
    await this.send({
      to: params.to,
      subject: `New driver application ${params.applicationNumber}`,
      html: adminApplicationReceived(params),
    });
  }
}
