import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Audience } from "@prisma/client";
import type { Request } from "express";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { CheckoutService } from "../../payment/services/checkout.service";
import { PaymentMethodService } from "../../payment/services/payment-method.service";
import { SubscriptionService } from "../../subscription/services/subscription.service";
import { getDriverCheckoutConfig } from "../config/checkout.config";
import type { DowngradeDto, RenewDto, SubscribeDto, UpgradeDto } from "../dto/subscription.dto";
import { DriverRepository } from "../repositories/driver.repository";
import { DriverSubscriptionRepository } from "../repositories/subscription.repository";
import type {
  OpenCheckoutMetadata,
  OpenCheckoutResult,
  OpenCheckoutStarted,
} from "../types/subscription";
import { requireBilling } from "../utils/require-billing";
import { requireDriver } from "../utils/require-driver";

@Injectable()
export class DriverSubscriptionService {
  constructor(
    @Inject(DriverRepository) private readonly drivers: DriverRepository,
    @Inject(DriverSubscriptionRepository)
    private readonly subscriptionRepo: DriverSubscriptionRepository,
    @Inject(SubscriptionService) private readonly subscriptions: SubscriptionService,
    @Inject(CheckoutService) private readonly checkoutService: CheckoutService,
    @Inject(PaymentMethodService) private readonly paymentMethods: PaymentMethodService,
    @Inject(ConfigService) private readonly configService: ConfigService,
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  async listPlans(request: Request) {
    await requireBilling(this.drivers, this.subscriptionRepo, request);
    return this.subscriptions.listPlans(Audience.DRIVER);
  }

  async getMine(request: Request) {
    const billing = await requireBilling(this.drivers, this.subscriptionRepo, request);
    return this.subscriptions.getMine(Audience.DRIVER, billing.id);
  }

  async subscribe(body: SubscribeDto, request: Request) {
    const billing = await requireBilling(this.drivers, this.subscriptionRepo, request);
    const started = await this.subscriptions.start({
      audience: Audience.DRIVER,
      owner: {
        referenceId: billing.id,
        freeUsedAt: billing.subscriptionFreeUsedAt,
      },
      planId: body.planId,
    });

    if (!started.checkoutRequired) {
      return started;
    }

    if (started.isTrialCheckout) {
      return this.openTrialSetup(
        started,
        { planId: body.planId, audience: Audience.DRIVER },
        request,
        billing.stripeCustomerId,
      );
    }

    return this.openCheckout(
      started,
      body.transactionId,
      { planId: body.planId, audience: Audience.DRIVER },
      request,
      billing.stripeCustomerId,
    );
  }

  async renew(body: RenewDto, request: Request) {
    const billing = await requireBilling(this.drivers, this.subscriptionRepo, request);
    const current = await this.subscriptions.getMine(Audience.DRIVER, billing.id);
    if (!current) {
      throw new NotFoundException("No subscription to renew");
    }

    const planId = body.planId ?? current.planId;
    const started = await this.subscriptions.renew({
      audience: Audience.DRIVER,
      owner: {
        referenceId: billing.id,
        freeUsedAt: billing.subscriptionFreeUsedAt,
      },
      planId,
    });

    if (!started.checkoutRequired) {
      return started;
    }

    if (started.isTrialCheckout) {
      return this.openTrialSetup(
        started,
        { planId, audience: Audience.DRIVER },
        request,
        billing.stripeCustomerId,
      );
    }

    return this.openCheckout(
      started,
      body.transactionId,
      { planId, audience: Audience.DRIVER },
      request,
      billing.stripeCustomerId,
    );
  }

  async upgrade(body: UpgradeDto, request: Request) {
    const billing = await requireBilling(this.drivers, this.subscriptionRepo, request);
    const started = await this.subscriptions.upgrade({
      audience: Audience.DRIVER,
      referenceId: billing.id,
      planId: body.planId,
    });

    if (!started.checkoutRequired) {
      return started;
    }

    return this.openCheckout(
      started,
      body.transactionId,
      { planId: body.planId, audience: Audience.DRIVER },
      request,
      billing.stripeCustomerId,
    );
  }

  async downgrade(body: DowngradeDto, request: Request) {
    const billing = await requireBilling(this.drivers, this.subscriptionRepo, request);
    return this.subscriptions.downgrade({
      audience: Audience.DRIVER,
      referenceId: billing.id,
      planId: body.planId,
    });
  }

  async cancel(request: Request) {
    const billing = await requireBilling(this.drivers, this.subscriptionRepo, request);
    return this.subscriptions.cancel(Audience.DRIVER, billing.id);
  }

  async resume(request: Request) {
    const billing = await requireBilling(this.drivers, this.subscriptionRepo, request);
    return this.subscriptions.resume(Audience.DRIVER, billing.id);
  }

  private async openTrialSetup(
    started: OpenCheckoutStarted,
    metadata: OpenCheckoutMetadata,
    request: Request,
    customerId: string | null,
  ): Promise<OpenCheckoutResult> {
    const driver = await requireDriver(this.drivers, request);
    const billing = await requireBilling(this.drivers, this.subscriptionRepo, request);
    const resolvedCustomerId = await this.paymentMethods.ensureCustomer({
      existingCustomerId: customerId,
      email: driver.user?.email ?? null,
      metadata: { driverId: billing.id },
    });

    if (!billing.stripeCustomerId) {
      await this.prisma.driver.update({
        where: { id: billing.id },
        data: { stripeCustomerId: resolvedCustomerId },
      });
    }

    const { successUrl, cancelUrl } = getDriverCheckoutConfig(this.configService);
    const session = await this.paymentMethods.createSetupSession({
      customerId: resolvedCustomerId,
      successUrl,
      cancelUrl,
      metadata: {
        driverId: billing.id,
        subscriptionId: started.subscriptionId,
        subscriptionTrialSetup: "true",
        audience: metadata.audience,
        planId: metadata.planId,
      },
    });

    return {
      subscriptionId: started.subscriptionId,
      purpose: started.purpose,
      amount: 0,
      checkoutUrl: session.checkoutUrl,
      sessionId: session.sessionId,
      isTrialCheckout: true,
    };
  }

  private async openCheckout(
    started: OpenCheckoutStarted,
    transactionId: string | undefined,
    metadata: OpenCheckoutMetadata,
    request: Request,
    customerId: string | null,
  ): Promise<OpenCheckoutResult> {
    const { successUrl, cancelUrl } = getDriverCheckoutConfig(this.configService);
    const checkoutInput: Parameters<CheckoutService["createSession"]>[0] = {
      purpose: started.purpose,
      referenceId: started.referenceId,
      amount: started.amount,
      description: started.description,
      successUrl,
      cancelUrl,
      savePaymentMethod: true,
      metadata: {
        subscriptionId: started.subscriptionId,
        audience: metadata.audience,
        planId: metadata.planId,
      },
    };
    if (transactionId !== undefined) {
      checkoutInput.transactionId = transactionId;
    }
    if (customerId) {
      checkoutInput.customerId = customerId;
    }

    const checkout = await this.checkoutService.createSession(checkoutInput, request);
    return {
      subscriptionId: started.subscriptionId,
      purpose: started.purpose,
      amount: started.amount,
      paymentId: checkout.paymentId,
      checkoutUrl: checkout.checkoutUrl,
      sessionId: checkout.sessionId,
    };
  }
}
