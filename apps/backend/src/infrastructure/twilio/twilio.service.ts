import { Inject, Injectable, Logger, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import twilio, { type Twilio } from "twilio";
import { getConfig, isComplete } from "./twilio.config";
import type { Message, Result } from "./types/twilio";

@Injectable()
export class TwilioService {
  private readonly logger = new Logger(TwilioService.name);
  private readonly client: Twilio | null;
  private readonly sid: string | null;
  private readonly from: string | null;

  constructor(@Inject(ConfigService) configService: ConfigService) {
    const config = getConfig(configService);

    if (!isComplete(config)) {
      this.logger.warn(
        "Twilio SMS disabled: set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_SENDER_ID",
      );
      this.client = null;
      this.sid = null;
      this.from = null;
      return;
    }

    try {
      this.client = twilio(config.sid, config.token);
      this.sid = config.sid;
      this.from = config.from;
      this.logger.log(`Twilio SMS ready (from=${config.from})`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Twilio SMS init failed: ${message}`);
      this.client = null;
      this.sid = null;
      this.from = null;
    }
  }

  isConfigured(): boolean {
    return this.client !== null && this.from !== null;
  }

  getClient(): Twilio {
    if (!this.client) {
      throw new ServiceUnavailableException("Twilio is not configured");
    }
    return this.client;
  }

  async send(input: Message): Promise<Result> {
    const client = this.getClient();
    if (!this.from) {
      throw new ServiceUnavailableException("Twilio is not configured");
    }

    const message = await client.messages.create({
      to: input.to,
      from: this.from,
      body: input.body,
    });

    return {
      sid: message.sid,
      status: message.status,
      to: message.to,
      from: message.from,
    };
  }

  async healthCheck(): Promise<boolean> {
    if (!this.client || !this.sid) {
      return false;
    }

    try {
      const account = await this.client.api.accounts(this.sid).fetch();
      return Boolean(account.sid);
    } catch {
      return false;
    }
  }
}
