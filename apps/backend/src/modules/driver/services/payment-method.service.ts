import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OnEvent } from "@nestjs/event-emitter";
import { Audience } from "@prisma/client";
import type { Request } from "express";
import { auditLog } from "../../../common/utils/audit-log";
import { toRequestContext } from "../../../common/utils/to-request-context";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { PaymentMethodService } from "../../payment/services/payment-method.service";
import type { SetupCompletedPayload } from "../../payment/types/payment-method";
import { SubscriptionService } from "../../subscription/services/subscription.service";
import { getDriverCheckoutConfig } from "../config/checkout.config";
import type { AddPaymentMethodDto, ConfirmPaymentMethodDto } from "../dto/payment-method.dto";
import { DriverRepository } from "../repositories/driver.repository";
import { DriverSubscriptionRepository } from "../repositories/subscription.repository";
import type { CheckoutOptions } from "../types/checkout";
import { requireBilling } from "../utils/require-billing";
import { requireDriver } from "../utils/require-driver";

@Injectable()
export class DriverPaymentMethodService {
  constructor(
    @Inject(DriverRepository) private readonly drivers: DriverRepository,
    @Inject(DriverSubscriptionRepository)
    private readonly subscriptionRepo: DriverSubscriptionRepository,
    @Inject(PaymentMethodService) private readonly paymentMethods: PaymentMethodService,
    @Inject(SubscriptionService) private readonly subscriptions: SubscriptionService,
    @Inject(ConfigService) private readonly configService: ConfigService,
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  async list(request: Request) {
    const billing = await requireBilling(this.drivers, this.subscriptionRepo, request);
    if (!billing.stripeCustomerId) {
      return [];
    }
    const current = await this.subscriptions.getMine(Audience.DRIVER, billing.id);
    return this.paymentMethods.list(
      billing.stripeCustomerId,
      current?.stripePaymentMethodId ?? null,
    );
  }

  async add(body: AddPaymentMethodDto, request: Request) {
    const context = toRequestContext(request);
    const driver = await requireDriver(this.drivers, request);
    const billing = await requireBilling(this.drivers, this.subscriptionRepo, request);

    const customerId = await this.paymentMethods.ensureCustomer({
      existingCustomerId: billing.stripeCustomerId,
      email: driver.user?.email ?? null,
      metadata: { driverId: billing.id },
    });

    if (!billing.stripeCustomerId) {
      await this.prisma.driver.update({
        where: { id: billing.id },
        data: { stripeCustomerId: customerId },
      });
    }

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
    const { successUrl, cancelUrl } = getDriverCheckoutConfig(this.configService, checkoutOptions);
    const session = await this.paymentMethods.createSetupSession({
      customerId,
      successUrl,
      cancelUrl,
      metadata: { driverId: billing.id },
    });

    await auditLog({
      prisma: this.prisma,
      event: "driver.payment_method_setup_started",
      result: "success",
      context,
      userId: context.userId,
      metadata: {
        driverId: billing.id,
        sessionId: session.sessionId,
        mode: "checkout",
      },
    });

    return session;
  }

  async createSetupIntent(request: Request) {
    const context = toRequestContext(request);
    const driver = await requireDriver(this.drivers, request);
    const billing = await requireBilling(this.drivers, this.subscriptionRepo, request);

    const customerId = await this.paymentMethods.ensureCustomer({
      existingCustomerId: billing.stripeCustomerId,
      email: driver.user?.email ?? null,
      metadata: { driverId: billing.id },
    });

    if (!billing.stripeCustomerId) {
      await this.prisma.driver.update({
        where: { id: billing.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const setupIntent = await this.paymentMethods.createSetupIntent({
      customerId,
      metadata: { driverId: billing.id },
    });

    await auditLog({
      prisma: this.prisma,
      event: "driver.payment_method_setup_started",
      result: "success",
      context,
      userId: context.userId,
      metadata: {
        driverId: billing.id,
        setupIntentId: setupIntent.setupIntentId,
        mode: "setup_intent",
      },
    });

    return setupIntent;
  }

  async confirm(body: ConfirmPaymentMethodDto, request: Request) {
    const billing = await requireBilling(this.drivers, this.subscriptionRepo, request);

    if (!body.sessionId && !body.setupIntentId) {
      throw new BadRequestException("sessionId or setupIntentId is required");
    }

    const completed = body.setupIntentId
      ? await this.paymentMethods.completeSetupIntent(body.setupIntentId)
      : await this.paymentMethods.completeSetupSession(body.sessionId!);

    if (billing.stripeCustomerId && completed.customerId !== billing.stripeCustomerId) {
      throw new BadRequestException("Setup does not belong to this driver");
    }
    if (completed.metadata["driverId"] && completed.metadata["driverId"] !== billing.id) {
      throw new BadRequestException("Setup does not belong to this driver");
    }

    await this.prisma.driver.updateMany({
      where: { id: billing.id, stripeCustomerId: null },
      data: { stripeCustomerId: completed.customerId },
    });
    const current = await this.subscriptions.getMine(Audience.DRIVER, billing.id);
    if (current) {
      await this.subscriptions.attachPaymentMethod(current.id, {
        customerId: completed.customerId,
        paymentMethodId: completed.paymentMethodId,
      });
    }

    return this.list(request);
  }

  async setDefault(paymentMethodId: string, request: Request) {
    const context = toRequestContext(request);
    const billing = await requireBilling(this.drivers, this.subscriptionRepo, request);
    if (!billing.stripeCustomerId) {
      throw new BadRequestException("No saved payment methods");
    }

    await this.paymentMethods.assertOwned(billing.stripeCustomerId, paymentMethodId);

    await this.prisma.driver.updateMany({
      where: { id: billing.id, stripeCustomerId: null },
      data: { stripeCustomerId: billing.stripeCustomerId },
    });
    const current = await this.subscriptions.getMine(Audience.DRIVER, billing.id);
    if (current) {
      await this.subscriptions.attachPaymentMethod(current.id, {
        customerId: billing.stripeCustomerId,
        paymentMethodId,
      });
    }

    await auditLog({
      prisma: this.prisma,
      event: "driver.payment_method_default_set",
      result: "success",
      context,
      userId: context.userId,
      metadata: {
        driverId: billing.id,
        paymentMethodId,
      },
    });

    return this.list(request);
  }

  async remove(paymentMethodId: string, request: Request) {
    const context = toRequestContext(request);
    const billing = await requireBilling(this.drivers, this.subscriptionRepo, request);
    if (!billing.stripeCustomerId) {
      throw new NotFoundException("Payment method not found");
    }

    await this.paymentMethods.detach(billing.stripeCustomerId, paymentMethodId);

    const current = await this.subscriptions.getMine(Audience.DRIVER, billing.id);
    if (current?.stripePaymentMethodId === paymentMethodId) {
      const remaining = await this.paymentMethods.list(billing.stripeCustomerId, null);
      const next = remaining[0];
      await this.subscriptions.attachPaymentMethod(current.id, {
        customerId: billing.stripeCustomerId,
        paymentMethodId: next?.id ?? null,
      });
    }

    await auditLog({
      prisma: this.prisma,
      event: "driver.payment_method_deleted",
      result: "success",
      context,
      userId: context.userId,
      metadata: {
        driverId: billing.id,
        paymentMethodId,
      },
    });

    return { message: "Payment method deleted" };
  }

  @OnEvent("payment_method.setup_completed")
  async onSetupCompleted(payload: SetupCompletedPayload) {
    const driverId = payload.metadata["driverId"];
    if (!driverId) {
      return;
    }

    await this.prisma.driver.updateMany({
      where: { id: driverId, stripeCustomerId: null },
      data: { stripeCustomerId: payload.customerId },
    });
    const current = await this.subscriptions.getMine(Audience.DRIVER, driverId);
    if (current) {
      await this.subscriptions.attachPaymentMethod(current.id, {
        customerId: payload.customerId,
        paymentMethodId: payload.paymentMethodId,
      });
    }
  }
}
