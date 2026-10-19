import {
  BadRequestException,
  Inject,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PaymentMode } from "@prisma/client";
import Stripe from "stripe";
import { PrismaService } from "../database/prisma.service";
import { getStripeConfig } from "./stripe.config";
import type { Client, Options, WebhookBody, WebhookHeaders } from "./types/stripe";

export const STRIPE_SIGNATURE_HEADER = "stripe-signature";
export const STRIPE_WEBHOOK_TOLERANCE_SECONDS = 300;

const GLOBAL_SETTINGS_ID = "global";

@Injectable()
export class StripeService {
  private readonly clients = new Map<PaymentMode, Client>();
  private readonly webhookSecrets = new Map<PaymentMode, string>();

  constructor(
    @Inject(ConfigService) configService: ConfigService,
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {
    const config = getStripeConfig(configService);
    const options: Options = {};
    if (config.apiVersion) {
      options.apiVersion = config.apiVersion as Stripe.LatestApiVersion;
    }
    if (config.timeoutMs !== undefined) {
      options.timeout = config.timeoutMs;
    }
    if (config.maxNetworkRetries !== undefined) {
      options.maxNetworkRetries = config.maxNetworkRetries;
    }

    if (config.test.secretKey) {
      this.clients.set(PaymentMode.TEST, new Stripe(config.test.secretKey, options));
    }
    if (config.test.webhookSecret) {
      this.webhookSecrets.set(PaymentMode.TEST, config.test.webhookSecret);
    }
    if (config.live.secretKey) {
      this.clients.set(PaymentMode.LIVE, new Stripe(config.live.secretKey, options));
    }
    if (config.live.webhookSecret) {
      this.webhookSecrets.set(PaymentMode.LIVE, config.live.webhookSecret);
    }
  }

  isConfigured() {
    return this.clients.size > 0;
  }

  isModeConfigured(mode: PaymentMode) {
    return this.clients.has(mode);
  }

  async getPaymentMode() {
    try {
      const settings = await this.prisma.platformSettings.findUnique({
        where: { id: GLOBAL_SETTINGS_ID },
        select: { paymentMode: true },
      });
      return settings?.paymentMode ?? PaymentMode.TEST;
    } catch {
      return PaymentMode.TEST;
    }
  }

  getClient(mode: PaymentMode) {
    const client = this.clients.get(mode);
    if (!client) {
      throw new ServiceUnavailableException(`Stripe ${mode.toLowerCase()} mode is not configured`);
    }
    return client;
  }

  async getClientForSettings() {
    const mode = await this.getPaymentMode();
    return this.getClient(mode);
  }

  constructWebhookEvent(rawBody: WebhookBody, signature: string) {
    const secrets = [...this.webhookSecrets.values()];
    if (secrets.length === 0) {
      throw new UnauthorizedException("Stripe webhook secret is not configured");
    }

    let lastError: unknown;
    for (const secret of secrets) {
      try {
        return Stripe.webhooks.constructEvent(
          rawBody,
          signature,
          secret,
          STRIPE_WEBHOOK_TOLERANCE_SECONDS,
        );
      } catch (error) {
        lastError = error;
      }
    }

    const message = lastError instanceof Error ? lastError.message.toLowerCase() : "";
    if (message.includes("timestamp") || message.includes("signature")) {
      throw new UnauthorizedException("Invalid Stripe webhook signature");
    }
    throw new BadRequestException("Malformed Stripe webhook payload");
  }

  extractSignature(headers: WebhookHeaders) {
    const raw = headers[STRIPE_SIGNATURE_HEADER] ?? headers["Stripe-Signature"];
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (!value || value.trim().length === 0) {
      throw new UnauthorizedException("Missing Stripe-Signature header");
    }
    return value.trim();
  }

  async healthCheck() {
    const mode = await this.getPaymentMode();
    const client = this.clients.get(mode) ?? this.clients.values().next().value;
    if (!client) {
      return false;
    }
    try {
      await client.balance.retrieve();
      return true;
    } catch {
      return false;
    }
  }
}
