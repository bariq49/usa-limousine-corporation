import {
  BadRequestException,
  Inject,
  Injectable,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PaymentMode } from "@prisma/client";
import Stripe from "stripe";
import type { CheckoutResult, CheckoutSession, CheckoutSessionInput } from "./types/stripe";

const CHECKOUT_TTL_SECONDS = 30 * 60;

@Injectable()
export class StripeService {
  private readonly clients = new Map<PaymentMode, Stripe>();

  constructor(@Inject(ConfigService) private readonly configService: ConfigService) {}

  isConfigured(mode: PaymentMode) {
    return Boolean(this.secretKey(mode) && this.webhookSecret(mode));
  }

  async createCheckoutSession(input: CheckoutSessionInput): Promise<CheckoutSession> {
    const amountInCents = Math.round(input.amount * 100);
    if (amountInCents < 50) {
      throw new BadRequestException("The booking total is too low to pay online");
    }

    const metadata = { bookingId: input.bookingId, bookingNumber: input.bookingNumber };
    const session = await this.client(input.mode).checkout.sessions.create({
      mode: "payment",
      submit_type: "book",
      allowed_payment_method_types: ["card"],
      customer_email: input.customerEmail,
      client_reference_id: input.bookingId,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: amountInCents,
            product_data: { name: `${input.description} · ${input.bookingNumber}` },
          },
        },
      ],
      payment_intent_data: {
        description: `USA Limousine · ${input.bookingNumber}`,
        receipt_email: input.customerEmail,
        metadata,
      },
      metadata,
      expires_at: Math.floor(Date.now() / 1000) + CHECKOUT_TTL_SECONDS,
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
    });

    if (!session.url) {
      throw new ServiceUnavailableException("Stripe did not return a checkout page");
    }
    return { id: session.id, url: session.url };
  }

  async retrieveCheckout(mode: PaymentMode, sessionId: string): Promise<CheckoutResult> {
    const session = await this.client(mode).checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent.latest_charge"],
    });
    return toCheckoutResult(session);
  }

  constructEvent(payload: Buffer, signature: string) {
    for (const mode of [PaymentMode.LIVE, PaymentMode.TEST]) {
      const secret = this.webhookSecret(mode);
      if (!secret || !this.secretKey(mode)) continue;
      try {
        return {
          event: this.client(mode).webhooks.constructEvent(payload, signature, secret),
          mode,
        };
      } catch {
        continue;
      }
    }
    throw new BadRequestException("Invalid Stripe webhook signature");
  }

  private client(mode: PaymentMode) {
    const existing = this.clients.get(mode);
    if (existing) return existing;

    const secretKey = this.secretKey(mode);
    if (!secretKey) {
      throw new ServiceUnavailableException(
        `Online payment is not set up (missing Stripe ${mode.toLowerCase()} key)`,
      );
    }
    const client = new Stripe(secretKey);
    this.clients.set(mode, client);
    return client;
  }

  private secretKey(mode: PaymentMode) {
    return this.configService.get<string>(`STRIPE_SECRET_KEY_${mode}`)?.trim() || undefined;
  }

  private webhookSecret(mode: PaymentMode) {
    return this.configService.get<string>(`STRIPE_WEBHOOK_SECRET_${mode}`)?.trim() || undefined;
  }
}

function toCheckoutResult(session: Stripe.Checkout.Session): CheckoutResult {
  const intent = typeof session.payment_intent === "object" ? session.payment_intent : null;
  const charge = intent && typeof intent.latest_charge === "object" ? intent.latest_charge : null;
  const card = charge?.payment_method_details?.card ?? null;

  return {
    sessionId: session.id,
    paid: session.payment_status === "paid",
    expired: session.status === "expired",
    transactionId:
      intent?.id ?? (typeof session.payment_intent === "string" ? session.payment_intent : null),
    amount: (session.amount_total ?? 0) / 100,
    currency: session.currency ?? "usd",
    cardBrand: card?.brand ?? null,
    cardLast4: card?.last4 ?? null,
  };
}
