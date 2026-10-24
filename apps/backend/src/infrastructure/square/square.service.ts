import { randomUUID } from "node:crypto";
import {
  BadRequestException,
  Inject,
  Injectable,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PaymentMode } from "@prisma/client";
import { SquareClient, SquareEnvironment, SquareError, WebhooksHelper } from "square";
import type { OrderResult, PaymentLink, PaymentLinkInput } from "./types/square";

@Injectable()
export class SquareService {
  private readonly clients = new Map<PaymentMode, SquareClient>();

  constructor(@Inject(ConfigService) private readonly configService: ConfigService) {}

  isConfigured(mode: PaymentMode) {
    return Boolean(
      this.setting("ACCESS_TOKEN", mode) &&
      this.setting("LOCATION_ID", mode) &&
      this.setting("WEBHOOK_SIGNATURE_KEY", mode) &&
      this.webhookUrl(),
    );
  }

  async createPaymentLink(input: PaymentLinkInput): Promise<PaymentLink> {
    const amountInCents = Math.round(input.amount * 100);
    if (amountInCents < 100) {
      throw new BadRequestException("The booking total is too low to pay online");
    }

    const paymentLinks = this.client(input.mode).checkout.paymentLinks;
    const paymentLink = await paymentLinks
      .create({
        idempotencyKey: randomUUID(),
        description: `USA Limousine · ${input.bookingNumber}`,
        paymentNote: input.bookingNumber,
        quickPay: {
          name: `${input.description} · ${input.bookingNumber}`,
          priceMoney: { amount: BigInt(amountInCents), currency: "USD" },
          locationId: this.setting("LOCATION_ID", input.mode) as string,
        },
        checkoutOptions: {
          redirectUrl: input.redirectUrl,
          askForShippingAddress: false,
          allowTipping: false,
          acceptedPaymentMethods: { applePay: true, googlePay: true },
        },
        prePopulatedData: { buyerEmail: input.customerEmail },
      })
      .then(async ({ paymentLink: created }) => {
        if (!created?.id || !created.orderId) return created;
        const { paymentLink: updated } = await paymentLinks.update({
          id: created.id,
          paymentLink: {
            version: created.version,
            checkoutOptions: {
              redirectUrl: `${input.redirectUrl}?orderId=${encodeURIComponent(created.orderId)}`,
            },
          },
        });
        return updated;
      })
      .catch((error: unknown) => {
        if (error instanceof SquareError) {
          throw new ServiceUnavailableException(
            "We could not start the payment. Please try again.",
          );
        }
        throw error;
      });

    if (!paymentLink?.id || !paymentLink.orderId || !paymentLink.url) {
      throw new ServiceUnavailableException("Square did not return a checkout page");
    }
    return { id: paymentLink.id, orderId: paymentLink.orderId, url: paymentLink.url };
  }

  async retrieveOrder(mode: PaymentMode, orderId: string): Promise<OrderResult> {
    const client = this.client(mode);
    const { order } = await client.orders.get({ orderId });
    const paymentId = order?.tenders?.find((tender) => tender.paymentId)?.paymentId ?? null;
    const payment = paymentId ? (await client.payments.get({ paymentId })).payment : undefined;
    const money = payment?.totalMoney ?? order?.totalMoney;

    return {
      orderId,
      paid: payment?.status === "COMPLETED",
      paymentId,
      amount: Number(money?.amount ?? 0) / 100,
      currency: (money?.currency ?? "USD").toLowerCase(),
      cardBrand: payment?.cardDetails?.card?.cardBrand ?? null,
      cardLast4: payment?.cardDetails?.card?.last4 ?? null,
    };
  }

  async refundPayment(mode: PaymentMode, paymentId: string, amount: number, reason: string) {
    const { refund } = await this.client(mode).refunds.refundPayment({
      idempotencyKey: `refund-${paymentId}`,
      paymentId,
      amountMoney: { amount: BigInt(Math.round(amount * 100)), currency: "USD" },
      reason: reason.slice(0, 192),
    });
    if (!refund?.id || refund.status === "REJECTED" || refund.status === "FAILED") {
      throw new ServiceUnavailableException("Square could not refund the payment");
    }
    return refund.id;
  }

  async deletePaymentLink(mode: PaymentMode, id: string) {
    await this.client(mode).checkout.paymentLinks.delete({ id });
  }

  async verifyWebhook(body: string, signature: string): Promise<PaymentMode> {
    const notificationUrl = this.webhookUrl();
    for (const mode of [PaymentMode.LIVE, PaymentMode.TEST]) {
      const signatureKey = this.setting("WEBHOOK_SIGNATURE_KEY", mode);
      if (!signatureKey || !notificationUrl) continue;
      const valid = await WebhooksHelper.verifySignature({
        requestBody: body,
        signatureHeader: signature,
        signatureKey,
        notificationUrl,
      });
      if (valid) return mode;
    }
    throw new BadRequestException("Invalid Square webhook signature");
  }

  private client(mode: PaymentMode) {
    const existing = this.clients.get(mode);
    if (existing) return existing;

    const token = this.setting("ACCESS_TOKEN", mode);
    if (!token) {
      throw new ServiceUnavailableException(
        `Online payment is not set up (missing Square ${mode.toLowerCase()} access token)`,
      );
    }
    const client = new SquareClient({
      token,
      environment:
        mode === PaymentMode.LIVE ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
    });
    this.clients.set(mode, client);
    return client;
  }

  private setting(name: string, mode: PaymentMode) {
    return this.configService.get<string>(`SQUARE_${name}_${mode}`)?.trim() || undefined;
  }

  private webhookUrl() {
    return this.configService.get<string>("SQUARE_WEBHOOK_URL")?.trim() || undefined;
  }
}
