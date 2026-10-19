import { BadRequestException, Controller, Headers, Inject, Post, Req } from "@nestjs/common";
import { StripeService } from "../../../infrastructure/stripe/stripe.service";
import { WebhookService } from "../services/webhook.service";
import type { WebhookHeaders, WebhookRequest } from "../types/webhook";

@Controller("payments/webhooks")
export class WebhookController {
  constructor(
    @Inject(WebhookService) private readonly webhookService: WebhookService,
    @Inject(StripeService) private readonly stripeService: StripeService,
  ) {}

  @Post("stripe")
  handleStripe(@Req() request: WebhookRequest, @Headers() headers: WebhookHeaders) {
    const rawBody = request.rawBody;
    if (!rawBody) {
      throw new BadRequestException("Missing raw body for Stripe webhook");
    }

    const signature = this.stripeService.extractSignature(headers);
    return this.webhookService.handleStripeWebhook(rawBody, signature);
  }
}
