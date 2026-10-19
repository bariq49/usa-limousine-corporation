import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OnEvent } from "@nestjs/event-emitter";
import type { Request } from "express";
import { auditLog } from "../../../common/utils/audit-log";
import { toRequestContext } from "../../../common/utils/to-request-context";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { PaymentMethodService } from "../../payment/services/payment-method.service";
import type { SetupCompletedPayload } from "../../payment/types/payment-method";
import { getCustomerCheckoutConfig } from "../config/checkout.config";
import type { AddPaymentMethodDto, ConfirmPaymentMethodDto } from "../dto/payment-method.dto";
import { CustomerRepository } from "../repositories/customer.repository";
import type { CheckoutOptions } from "../types/checkout";
import { requireCustomer } from "../utils/require-customer";

@Injectable()
export class CustomerPaymentMethodService {
  constructor(
    @Inject(CustomerRepository) private readonly customers: CustomerRepository,
    @Inject(PaymentMethodService) private readonly paymentMethods: PaymentMethodService,
    @Inject(ConfigService) private readonly configService: ConfigService,
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  async list(request: Request) {
    const customer = await requireCustomer(this.customers, request);
    if (!customer.stripeCustomerId) {
      return [];
    }
    return this.paymentMethods.list(
      customer.stripeCustomerId,
      customer.stripePaymentMethodId ?? null,
    );
  }

  async add(body: AddPaymentMethodDto, request: Request) {
    const context = toRequestContext(request);
    const customer = await this.ensureStripeCustomer(request);

    const checkoutOptions: CheckoutOptions = {
      successPath: "/payment-methods/success",
      cancelPath: "/payment-methods/cancel",
    };
    if (body.successUrl !== undefined) {
      checkoutOptions.successUrl = body.successUrl;
    }
    if (body.cancelUrl !== undefined) {
      checkoutOptions.cancelUrl = body.cancelUrl;
    }
    const { successUrl, cancelUrl } = getCustomerCheckoutConfig(
      this.configService,
      checkoutOptions,
    );

    const session = await this.paymentMethods.createSetupSession({
      customerId: customer.stripeCustomerId,
      successUrl,
      cancelUrl,
      metadata: { customerId: customer.id },
    });

    await auditLog({
      prisma: this.prisma,
      event: "customer.payment_method_setup_started",
      result: "success",
      context,
      userId: context.userId,
      metadata: {
        customerId: customer.id,
        sessionId: session.sessionId,
        mode: "checkout",
      },
    });

    return session;
  }

  async createSetupIntent(request: Request) {
    const context = toRequestContext(request);
    const customer = await this.ensureStripeCustomer(request);

    const setupIntent = await this.paymentMethods.createSetupIntent({
      customerId: customer.stripeCustomerId,
      metadata: { customerId: customer.id },
    });

    await auditLog({
      prisma: this.prisma,
      event: "customer.payment_method_setup_started",
      result: "success",
      context,
      userId: context.userId,
      metadata: {
        customerId: customer.id,
        setupIntentId: setupIntent.setupIntentId,
        mode: "setup_intent",
      },
    });

    return setupIntent;
  }

  async confirm(body: ConfirmPaymentMethodDto, request: Request) {
    const customer = await requireCustomer(this.customers, request);

    if (!body.sessionId && !body.setupIntentId) {
      throw new BadRequestException("sessionId or setupIntentId is required");
    }

    const completed = body.setupIntentId
      ? await this.paymentMethods.completeSetupIntent(body.setupIntentId)
      : await this.paymentMethods.completeSetupSession(body.sessionId!);

    await this.assertOwnsSetup(customer.id, customer.stripeCustomerId, completed);
    await this.attachPaymentMethod({
      customerId: customer.id,
      stripeCustomerId: completed.customerId,
      paymentMethodId: completed.paymentMethodId,
      setAsDefault: !customer.stripePaymentMethodId,
    });

    return this.list(request);
  }

  async setDefault(paymentMethodId: string, request: Request) {
    const context = toRequestContext(request);
    const customer = await requireCustomer(this.customers, request);
    if (!customer.stripeCustomerId) {
      throw new BadRequestException("No saved payment methods");
    }

    await this.paymentMethods.assertOwned(customer.stripeCustomerId, paymentMethodId);
    await this.attachPaymentMethod({
      customerId: customer.id,
      stripeCustomerId: customer.stripeCustomerId,
      paymentMethodId,
      setAsDefault: true,
    });

    await auditLog({
      prisma: this.prisma,
      event: "customer.payment_method_default_set",
      result: "success",
      context,
      userId: context.userId,
      metadata: {
        customerId: customer.id,
        paymentMethodId,
      },
    });

    return this.list(request);
  }

  async remove(paymentMethodId: string, request: Request) {
    const context = toRequestContext(request);
    const customer = await requireCustomer(this.customers, request);
    if (!customer.stripeCustomerId) {
      throw new NotFoundException("Payment method not found");
    }

    const wasDefault = customer.stripePaymentMethodId === paymentMethodId;
    await this.paymentMethods.detach(customer.stripeCustomerId, paymentMethodId);

    if (wasDefault) {
      const remaining = await this.paymentMethods.list(customer.stripeCustomerId, null);
      const nextId = remaining[0]?.id ?? null;
      await this.attachPaymentMethod({
        customerId: customer.id,
        stripeCustomerId: customer.stripeCustomerId,
        paymentMethodId: nextId,
        setAsDefault: true,
      });
    }

    await auditLog({
      prisma: this.prisma,
      event: "customer.payment_method_deleted",
      result: "success",
      context,
      userId: context.userId,
      metadata: {
        customerId: customer.id,
        paymentMethodId,
      },
    });

    return { message: "Payment method deleted" };
  }

  @OnEvent("payment_method.setup_completed")
  async onSetupCompleted(payload: SetupCompletedPayload) {
    const customerId = payload.metadata["customerId"];
    if (!customerId) {
      return;
    }

    const existing = await this.prisma.customer.findFirst({
      where: { id: customerId, deletedAt: null },
    });
    if (!existing) {
      return;
    }

    if (existing.stripeCustomerId && existing.stripeCustomerId !== payload.customerId) {
      return;
    }

    await this.attachPaymentMethod({
      customerId,
      stripeCustomerId: payload.customerId,
      paymentMethodId: payload.paymentMethodId,
      setAsDefault: !existing.stripePaymentMethodId,
    });
  }

  private async ensureStripeCustomer(request: Request) {
    const customer = await requireCustomer(this.customers, request);
    const stripeCustomerId = await this.paymentMethods.ensureCustomer({
      existingCustomerId: customer.stripeCustomerId,
      email: customer.user.email,
      metadata: { customerId: customer.id },
    });

    if (!customer.stripeCustomerId) {
      await this.prisma.customer.update({
        where: { id: customer.id },
        data: { stripeCustomerId },
      });
    }

    return {
      id: customer.id,
      stripeCustomerId,
    };
  }

  private assertOwnsSetup(
    customerId: string,
    stripeCustomerId: string | null,
    completed: SetupCompletedPayload,
  ) {
    if (stripeCustomerId && completed.customerId !== stripeCustomerId) {
      throw new BadRequestException("Setup does not belong to this customer");
    }
    if (completed.metadata["customerId"] && completed.metadata["customerId"] !== customerId) {
      throw new BadRequestException("Setup does not belong to this customer");
    }
  }

  private async attachPaymentMethod(params: {
    customerId: string;
    stripeCustomerId: string;
    paymentMethodId: string | null;
    setAsDefault: boolean;
  }) {
    await this.prisma.customer.update({
      where: { id: params.customerId },
      data: {
        stripeCustomerId: params.stripeCustomerId,
        ...(params.setAsDefault ? { stripePaymentMethodId: params.paymentMethodId } : {}),
      },
    });

    if (params.setAsDefault) {
      await this.paymentMethods.setDefaultPaymentMethod(
        params.stripeCustomerId,
        params.paymentMethodId,
      );
    }
  }
}
