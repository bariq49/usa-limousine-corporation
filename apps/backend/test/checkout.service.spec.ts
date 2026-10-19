import { BadRequestException, ConflictException, NotFoundException } from "@nestjs/common";
import { BookingStatus, PaymentPurpose, PaymentStatus } from "@prisma/client";
import { CheckoutValidator } from "../src/modules/booking/validators/checkout.validator";
import { CheckoutService } from "../src/modules/payment/services/checkout.service";
import { ValidatorRegistry } from "../src/modules/payment/services/validator.registry";
import {
  assertCheckoutPaymentAllowed,
  assertSupportedPurpose,
} from "../src/modules/payment/utils/checkout-validation";

describe("CheckoutService guards", () => {
  it("rejects checkout when payment already succeeded", async () => {
    const registry = new ValidatorRegistry();
    registry.register({
      purpose: PaymentPurpose.BOOKING,
      validate: async () => undefined,
    });

    const service = new CheckoutService(
      {
        prepareForCheckout: async () => {
          throw new ConflictException("Payment is already succeeded");
        },
      } as never,
      {} as never,
      { get: () => undefined } as never,
      {} as never,
      registry,
    );

    await expect(
      service.createSession({
        purpose: PaymentPurpose.BOOKING,
        referenceId: "book1",
        amount: 50,
        description: "Booking",
        successUrl: "https://ok.example",
        cancelUrl: "https://cancel.example",
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("rolls back a newly created payment when stripe fails", async () => {
    const deleteById = jest.fn(async () => undefined);
    const registry = new ValidatorRegistry();
    registry.register({
      purpose: PaymentPurpose.BOOKING,
      validate: async () => undefined,
    });

    const service = new CheckoutService(
      {
        prepareForCheckout: async () => ({
          payment: { id: "pay_new", purpose: PaymentPurpose.BOOKING, referenceId: "book1" },
          created: true,
        }),
        deleteById,
      } as never,
      {
        getClientForSettings: async () => ({
          checkout: {
            sessions: {
              create: async () => {
                throw new Error("stripe down");
              },
            },
          },
        }),
      } as never,
      { get: () => undefined } as never,
      {} as never,
      registry,
    );

    await expect(
      service.createSession({
        purpose: PaymentPurpose.BOOKING,
        referenceId: "book1",
        amount: 50,
        description: "Booking",
        successUrl: "https://ok.example",
        cancelUrl: "https://cancel.example",
      }),
    ).rejects.toThrow("stripe down");

    expect(deleteById).toHaveBeenCalledWith("pay_new");
  });
});

describe("assertCheckoutPaymentAllowed", () => {
  it("rejects when booking payment already succeeded", () => {
    expect(() =>
      assertCheckoutPaymentAllowed(PaymentStatus.SUCCEEDED, PaymentPurpose.BOOKING),
    ).toThrow(ConflictException);
  });

  it("allows subscription renew after a prior succeeded payment", () => {
    expect(() =>
      assertCheckoutPaymentAllowed(PaymentStatus.SUCCEEDED, PaymentPurpose.DRIVER_SUBSCRIPTION),
    ).not.toThrow();
  });
});

describe("assertSupportedPurpose", () => {
  it("accepts known payment purposes", () => {
    expect(() => assertSupportedPurpose(PaymentPurpose.BOOKING)).not.toThrow();
  });

  it("rejects unsupported payment purpose", () => {
    expect(() => assertSupportedPurpose("UNKNOWN" as PaymentPurpose)).toThrow(BadRequestException);
  });
});

describe("ValidatorRegistry", () => {
  it("fails closed when no validator is registered", async () => {
    const registry = new ValidatorRegistry();
    await expect(
      registry.validate({
        purpose: PaymentPurpose.DRIVER_SUBSCRIPTION,
        referenceId: "sub1",
        amount: 10,
        description: "Sub",
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

describe("CheckoutValidator", () => {
  it("registers subscription purposes and validates incomplete rows", async () => {
    const { SubscriptionCheckoutRegistrar } =
      await import("../src/modules/subscription/services/checkout.registrar");
    const registry = new ValidatorRegistry();
    const findById = jest.fn(async (query: { id: string }) =>
      query.id === "sub1"
        ? {
            status: "INCOMPLETE",
            plan: { amount: { toString: () => "29.99" } },
          }
        : null,
    );
    const registrar = new SubscriptionCheckoutRegistrar(registry, {
      findById,
    } as never);
    registrar.onModuleInit();

    await expect(
      registry.validate({
        purpose: PaymentPurpose.DRIVER_SUBSCRIPTION,
        referenceId: "sub1",
        amount: 29.99,
        description: "Driver plan",
      }),
    ).resolves.toBeUndefined();

    await expect(
      registry.validate({
        purpose: PaymentPurpose.DRIVER_SUBSCRIPTION,
        referenceId: "missing",
        amount: 29.99,
        description: "Driver plan",
      }),
    ).rejects.toThrow(/not found/i);

    await expect(
      registry.validate({
        purpose: PaymentPurpose.AGENCY_SUBSCRIPTION,
        referenceId: "sub1",
        amount: 29.99,
        description: "Agency plan",
      }),
    ).resolves.toBeUndefined();
  });
});

describe("CheckoutValidator", () => {
  it("rejects when amount does not match booking total", async () => {
    const validator = new CheckoutValidator(
      {
        findById: async () => ({
          id: "book1",
          status: BookingStatus.PENDING,
          pricing: { total: 50 },
          acceptedOfferId: null,
        }),
      } as never,
      { findById: async () => null } as never,
    );

    await expect(
      validator.validate({
        purpose: PaymentPurpose.BOOKING,
        referenceId: "book1",
        amount: 40,
        description: "Booking",
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("rejects when booking is missing", async () => {
    const validator = new CheckoutValidator(
      { findById: async () => null } as never,
      { findById: async () => null } as never,
    );

    await expect(
      validator.validate({
        purpose: PaymentPurpose.BOOKING,
        referenceId: "missing",
        amount: 50,
        description: "Booking",
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("accepts quoted offer amount when awaiting payment", async () => {
    const validator = new CheckoutValidator(
      {
        findById: async () => ({
          id: "book1",
          status: BookingStatus.AWAITING_PAYMENT,
          pricing: { total: 50 },
          acceptedOfferId: "offer1",
        }),
      } as never,
      {
        findById: async () => ({
          id: "offer1",
          quotedPrice: 62.5,
        }),
      } as never,
    );

    await expect(
      validator.validate({
        purpose: PaymentPurpose.BOOKING,
        referenceId: "book1",
        amount: 62.5,
        description: "Booking",
      }),
    ).resolves.toBeUndefined();
  });
});
