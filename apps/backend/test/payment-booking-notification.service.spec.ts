import { Test, type TestingModule } from "@nestjs/testing";
import { PaymentPurpose, PaymentStatus } from "@prisma/client";
import { AppLogger } from "../src/common/logger/app.logger";
import { StripeService } from "../src/infrastructure/stripe/stripe.service";
import { OutboxRepository } from "../src/modules/payment/repositories/outbox.repository";
import { WebhookRepository } from "../src/modules/payment/repositories/webhook.repository";
import { OutboxService } from "../src/modules/payment/services/outbox.service";
import { PaymentMethodService } from "../src/modules/payment/services/payment-method.service";
import { RefundService } from "../src/modules/payment/services/refund.service";
import { WebhookService } from "../src/modules/payment/services/webhook.service";

const loggerMock = {
  provide: AppLogger,
  useValue: { warn: jest.fn(), error: jest.fn(), log: jest.fn(), debug: jest.fn() },
};

const paymentMethodMock = {
  provide: PaymentMethodService,
  useValue: { completeSetupSession: jest.fn(async () => undefined) },
};

const webhookRepositoryMock = (overrides: Record<string, unknown> = {}) => ({
  tryRecordEvent: jest.fn(async () => true),
  deleteEvent: jest.fn(async () => undefined),
  findById: async () => null,
  findByCheckoutSessionId: async () => null,
  update: jest.fn(async () => undefined),
  ...overrides,
});

describe("WebhookService", () => {
  it("ignores duplicate stripe events", async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhookService,
        {
          provide: WebhookRepository,
          useValue: webhookRepositoryMock({
            tryRecordEvent: jest.fn(async () => false),
          }),
        },
        { provide: OutboxRepository, useValue: {} },
        {
          provide: StripeService,
          useValue: {
            constructWebhookEvent: () => ({ id: "evt_dup", type: "checkout.session.completed" }),
          },
        },
        { provide: RefundService, useValue: { handleChargeRefunded: jest.fn() } },
        { provide: OutboxService, useValue: { enqueueDispatch: jest.fn() } },
        paymentMethodMock,
        loggerMock,
      ],
    }).compile();

    const service = module.get(WebhookService);
    const result = await service.handleStripeWebhook(Buffer.from("{}"), "sig");

    expect(result).toEqual({ received: true, ignored: true });
  });

  it("writes outbox and enqueues dispatch on checkout.session.completed", async () => {
    const commit = jest.fn(async () => ({
      payment: {
        id: "pay1",
        purpose: PaymentPurpose.BOOKING,
        referenceId: "book1",
        status: PaymentStatus.SUCCEEDED,
      },
      outbox: { id: "outbox1" },
    }));
    const enqueueDispatch = jest.fn(async () => undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhookService,
        {
          provide: WebhookRepository,
          useValue: webhookRepositoryMock({
            findById: async () => ({
              id: "pay1",
              purpose: PaymentPurpose.BOOKING,
              referenceId: "book1",
              status: PaymentStatus.PENDING,
              checkout: { checkoutUrl: "https://checkout.example" },
              method: { provider: "stripe" },
            }),
          }),
        },
        { provide: OutboxRepository, useValue: { commit } },
        {
          provide: StripeService,
          useValue: {
            constructWebhookEvent: () => ({ id: "evt_1", type: "checkout.session.completed" }),
            getClient: () => ({
              paymentIntents: {
                retrieve: async () => ({
                  payment_method: {
                    type: "card",
                    card: { brand: "visa", last4: "4242", exp_month: 12, exp_year: 2030 },
                  },
                }),
              },
            }),
          },
        },
        { provide: RefundService, useValue: { handleChargeRefunded: jest.fn() } },
        { provide: OutboxService, useValue: { enqueueDispatch } },
        paymentMethodMock,
        loggerMock,
      ],
    }).compile();

    const service = module.get(WebhookService);
    await (
      service as unknown as {
        onCheckoutSessionCompleted: (session: {
          id: string;
          metadata?: Record<string, string>;
          payment_intent?: string;
        }) => Promise<void>;
      }
    ).onCheckoutSessionCompleted({
      id: "cs_1",
      metadata: { paymentId: "pay1" },
      payment_intent: "pi_1",
    });

    expect(commit).toHaveBeenCalledWith({
      paymentId: "pay1",
      data: expect.objectContaining({
        status: PaymentStatus.SUCCEEDED,
        method: expect.objectContaining({
          provider: "stripe",
          brand: "visa",
          last4: "4242",
        }),
      }),
      event: "payment.succeeded",
      payload: expect.objectContaining({
        id: "pay1",
        referenceId: "book1",
        status: PaymentStatus.SUCCEEDED,
      }),
    });
    expect(enqueueDispatch).toHaveBeenCalledWith("outbox1");
  });

  it("writes outbox on payment_intent.payment_failed", async () => {
    const commit = jest.fn(async () => ({
      payment: { id: "pay1", status: PaymentStatus.FAILED },
      outbox: { id: "outbox2" },
    }));
    const enqueueDispatch = jest.fn(async () => undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhookService,
        {
          provide: WebhookRepository,
          useValue: webhookRepositoryMock({
            findById: async () => ({
              id: "pay1",
              purpose: PaymentPurpose.BOOKING,
              referenceId: "book1",
              status: PaymentStatus.PENDING,
            }),
          }),
        },
        { provide: OutboxRepository, useValue: { commit } },
        {
          provide: StripeService,
          useValue: {
            constructWebhookEvent: () => ({ id: "evt_3", type: "payment_intent.payment_failed" }),
          },
        },
        { provide: RefundService, useValue: { handleChargeRefunded: jest.fn() } },
        { provide: OutboxService, useValue: { enqueueDispatch } },
        paymentMethodMock,
        loggerMock,
      ],
    }).compile();

    const service = module.get(WebhookService);
    await (
      service as unknown as {
        onPaymentIntentFailed: (intent: {
          metadata?: Record<string, string>;
          last_payment_error?: { code?: string; message?: string };
        }) => Promise<void>;
      }
    ).onPaymentIntentFailed({
      metadata: { paymentId: "pay1" },
      last_payment_error: { code: "card_declined", message: "Card declined" },
    });

    expect(commit).toHaveBeenCalledWith({
      paymentId: "pay1",
      data: expect.objectContaining({
        status: PaymentStatus.FAILED,
        failureCode: "card_declined",
      }),
      event: expect.any(String),
      payload: expect.objectContaining({ referenceId: "book1" }),
    });
    expect(enqueueDispatch).toHaveBeenCalledWith("outbox2");
  });

  it("delegates charge.refunded to RefundService", async () => {
    const handleChargeRefunded = jest.fn(async () => undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhookService,
        { provide: WebhookRepository, useValue: webhookRepositoryMock() },
        { provide: OutboxRepository, useValue: {} },
        {
          provide: StripeService,
          useValue: {
            constructWebhookEvent: () => ({
              id: "evt_4",
              type: "charge.refunded",
              data: { object: { metadata: { paymentId: "pay1" }, amount_refunded: 5000 } },
            }),
          },
        },
        { provide: RefundService, useValue: { handleChargeRefunded } },
        { provide: OutboxService, useValue: { enqueueDispatch: jest.fn() } },
        paymentMethodMock,
        loggerMock,
      ],
    }).compile();

    const service = module.get(WebhookService);
    await service.handleStripeWebhook(Buffer.from("{}"), "sig");

    expect(handleChargeRefunded).toHaveBeenCalledWith(
      expect.objectContaining({ metadata: { paymentId: "pay1" } }),
    );
  });
});
