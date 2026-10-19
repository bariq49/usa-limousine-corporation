import { Injectable } from "@nestjs/common";
import type { Transporter } from "nodemailer";
import type { SendMailOptions, SendMailResult } from "../types/mail";

@Injectable()
export class NodemailerEmailProvider {
  constructor(private readonly transport: Transporter) {}

  async send(options: SendMailOptions & { from: string }): Promise<SendMailResult> {
    const info = await this.transport.sendMail({
      from: options.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      cc: options.cc,
      bcc: options.bcc,
      replyTo: options.replyTo,
      attachments: options.attachments,
    });

    return {
      messageId: info.messageId,
      accepted: info.accepted.map(String),
      rejected: info.rejected.map(String),
    };
  }

  async verify(): Promise<boolean> {
    await this.transport.verify();
    return true;
  }
}
