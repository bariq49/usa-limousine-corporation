import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { StripeService } from "../../../infrastructure/stripe/stripe.service";
import type {
  EnsureCustomerInput,
  EnsureCustomerParams,
  SetupCompletedPayload,
  SetupIntentCreateParams,
  SetupIntentInput,
  SetupSessionInput,
  SetupSessionParams,
  ToSetupCompletedPayloadParams,
} from "../types/payment-method";

@Injectable()
export class PaymentMethodService {
  constructor(
    @Inject(StripeService) private readonly stripe: StripeService,
    @Inject(EventEmitter2) private readonly events: EventEmitter2,
  ) {}

  async ensureCustomer(input: EnsureCustomerInput) {
    if (input.existingCustomerId) {
      return input.existingCustomerId;
    }

    const client = await this.stripe.getClientForSettings();
    const createParams: EnsureCustomerParams = {};
    if (input.email) {
      createParams.email = input.email;
    }
    if (input.name) {
      createParams.name = input.name;
    }
    if (input.metadata) {
      createParams.metadata = input.metadata;
    }
    const customer = await client.customers.create(createParams);
    return customer.id;
  }

  async list(customerId: string, defaultPaymentMethodId?: string | null) {
    const client = await this.stripe.getClientForSettings();
    const methods = await client.paymentMethods.list({
      customer: customerId,
      type: "card",
    });

    return methods.data.map((method) => ({
      id: method.id,
      brand: method.card?.brand ?? null,
      last4: method.card?.last4 ?? null,
      expMonth: method.card?.exp_month ?? null,
      expYear: method.card?.exp_year ?? null,
      isDefault: defaultPaymentMethodId != null && method.id === defaultPaymentMethodId,
    }));
  }

  async createSetupSession(input: SetupSessionInput) {
    if (!input.successUrl.trim() || !input.cancelUrl.trim()) {
      throw new BadRequestException("Checkout successUrl and cancelUrl are required");
    }

    const client = await this.stripe.getClientForSettings();
    const sessionParams: SetupSessionParams = {
      mode: "setup",
      customer: input.customerId,
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      payment_method_types: ["card"],
    };
    if (input.metadata) {
      sessionParams.metadata = input.metadata;
      sessionParams.setup_intent_data = { metadata: input.metadata };
    }

    const session = await client.checkout.sessions.create(sessionParams);

    if (!session.url) {
      throw new BadRequestException("Stripe did not return a checkout URL");
    }

    return {
      sessionId: session.id,
      checkoutUrl: session.url,
    };
  }

  async createSetupIntent(input: SetupIntentInput) {
    const client = await this.stripe.getClientForSettings();
    const createParams: SetupIntentCreateParams = {
      customer: input.customerId,
      payment_method_types: ["card"],
      usage: "off_session",
    };
    if (input.metadata) {
      createParams.metadata = input.metadata;
    }

    const setupIntent = await client.setupIntents.create(createParams);

    if (!setupIntent.client_secret) {
      throw new BadRequestException("Stripe did not return a setup intent client secret");
    }

    return {
      setupIntentId: setupIntent.id,
      clientSecret: setupIntent.client_secret,
    };
  }

  async completeSetupSession(sessionId: string) {
    const client = await this.stripe.getClientForSettings();
    const session = await client.checkout.sessions.retrieve(sessionId, {
      expand: ["setup_intent"],
    });

    if (session.mode !== "setup") {
      throw new BadRequestException("Checkout session is not a setup session");
    }
    if (session.status !== "complete") {
      throw new BadRequestException("Checkout setup session is not complete");
    }

    const customerId =
      typeof session.customer === "string" ? session.customer : session.customer?.id;
    if (!customerId) {
      throw new BadRequestException("Setup session has no customer");
    }

    const setupIntent =
      typeof session.setup_intent === "string"
        ? await client.setupIntents.retrieve(session.setup_intent)
        : session.setup_intent;
    if (!setupIntent || typeof setupIntent === "string") {
      throw new BadRequestException("Setup session has no setup intent");
    }

    return this.toSetupCompletedPayload({
      customerId,
      setupIntent,
      metadataSource: session.metadata,
    });
  }

  async completeSetupIntent(setupIntentId: string) {
    const client = await this.stripe.getClientForSettings();
    const setupIntent = await client.setupIntents.retrieve(setupIntentId);
    if (setupIntent.status !== "succeeded") {
      throw new BadRequestException("Setup intent is not succeeded");
    }

    const customerId =
      typeof setupIntent.customer === "string" ? setupIntent.customer : setupIntent.customer?.id;
    if (!customerId) {
      throw new BadRequestException("Setup intent has no customer");
    }

    return this.toSetupCompletedPayload({
      customerId,
      setupIntent,
      metadataSource: setupIntent.metadata,
    });
  }

  private toSetupCompletedPayload(params: ToSetupCompletedPayloadParams): SetupCompletedPayload {
    const paymentMethodId =
      typeof params.setupIntent.payment_method === "string"
        ? params.setupIntent.payment_method
        : params.setupIntent.payment_method?.id;
    if (!paymentMethodId) {
      throw new BadRequestException("Setup has no payment method");
    }

    const metadata: Record<string, string> = {};
    const source = params.metadataSource ?? params.setupIntent.metadata;
    if (source) {
      for (const key of Object.keys(source)) {
        const value = source[key];
        if (value != null) {
          metadata[key] = value;
        }
      }
    }

    const payload: SetupCompletedPayload = {
      customerId: params.customerId,
      paymentMethodId,
      metadata,
    };
    this.events.emit("payment_method.setup_completed", payload);
    return payload;
  }

  async assertOwned(customerId: string, paymentMethodId: string) {
    const client = await this.stripe.getClientForSettings();
    let method;
    try {
      method = await client.paymentMethods.retrieve(paymentMethodId);
    } catch {
      throw new NotFoundException("Payment method not found");
    }

    const owner = typeof method.customer === "string" ? method.customer : method.customer?.id;
    if (owner !== customerId) {
      throw new NotFoundException("Payment method not found");
    }
    return method;
  }

  async detach(customerId: string, paymentMethodId: string) {
    await this.assertOwned(customerId, paymentMethodId);
    const client = await this.stripe.getClientForSettings();
    await client.paymentMethods.detach(paymentMethodId);
  }

  async getDefaultPaymentMethodId(customerId: string): Promise<string | null> {
    const client = await this.stripe.getClientForSettings();
    const customer = await client.customers.retrieve(customerId);
    if (customer.deleted) {
      return null;
    }
    const defaultMethod = customer.invoice_settings?.default_payment_method;
    if (!defaultMethod) {
      return null;
    }
    return typeof defaultMethod === "string" ? defaultMethod : defaultMethod.id;
  }

  async setDefaultPaymentMethod(customerId: string, paymentMethodId?: string | null) {
    const client = await this.stripe.getClientForSettings();
    if (paymentMethodId) {
      await this.assertOwned(customerId, paymentMethodId);
      await client.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
      return;
    }

    await client.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: "",
      },
    });
  }
}
