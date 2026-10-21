import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppLogger } from "../../common/logger/app.logger";
import { getEmailConfig } from "./email.config";
import { NodemailerEmailProvider } from "./providers/nodemailer.provider";
import { passwordReset } from "./templates/password-reset";
import { verification } from "./templates/verification";
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
}
