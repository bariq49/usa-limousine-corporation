import { BookingStatus, PaymentMode, PaymentStatus } from "@prisma/client";
import { PaymentService } from "../src/modules/payment/services/payment.service";

const body = {
  vehicleCategoryId: "cat-1",
  vehicleCount: 1,
  address: { pickup: { address: "A" }, dropoff: { address: "B" }, distance: 10, duration: 20 },
  passenger: { passengerCount: 1, name: "Ada", phone: "+17322898928", email: "ada@example.com" },
  bookingTime: { pickupDate: "2030-09-11", pickupTime: "14:00" },
  pricing: { basePrice: 1, total: 1 },
} as never;
const request = { headers: {} } as never;
const passenger = { name: "Ada", email: "ada@example.com", phone: "+17322898928" };

const paidResult = {
  sessionId: "cs_test_1",
  paid: true,
  expired: false,
  transactionId: "pi_1",
  amount: 110,
  currency: "usd",
  cardBrand: "visa",
  cardLast4: "4242",
};

function setup(
  options: {
    configured?: boolean;
    status?: BookingStatus;
    result?: typeof paidResult;
    recorded?: boolean;
    createSession?: jest.Mock;
  } = {},
) {
  const bookingRepository = {
    create: jest.fn(async () => ({ id: "book-1", bookingNumber: "BK-1" })),
    attachCheckoutSession: jest.fn(async () => undefined),
    delete: jest.fn(async () => undefined),
    findByCheckoutSession: jest.fn(async () => ({
      id: "book-1",
      status: options.status ?? BookingStatus.PENDING,
      bookingNumber: "BK-000001",
      passenger,
    })),
    findById: jest.fn(async () => ({
      id: "book-1",
      userId: null,
      bookingNumber: "BK-000001",
      bookingType: "ONE_WAY",
      vehicleCount: 1,
      status: BookingStatus.CONFIRMED,
      totalPrice: { toFixed: () => "110.00" },
      vehicleCategory: { name: "Sedan", description: null, image: null, passengerCount: 4 },
      address: { pickup: { address: "A" }, dropoff: { address: "B" }, distance: 10, duration: 20 },
      passenger: Object.assign({ passengerCount: 1 }, passenger),
      bookingTime: { pickupDate: "2030-09-11", pickupTime: "14:00" },
      flightDetails: null,
      meetAndGreet: null,
      luggage: [],
      extraServices: [],
      notes: null,
      pricing: { total: 110 },
      payment: {
        status: PaymentStatus.PAID,
        transactionId: "pi_1",
        amount: { toNumber: () => 110 },
        currency: "usd",
        cardBrand: "visa",
        cardLast4: "4242",
        paidAt: new Date("2030-01-01T00:00:00Z"),
      },
    })),
  };
  const paymentRepository = {
    recordPaid: jest.fn(async () => options.recorded ?? true),
    recordCancelled: jest.fn(async () => true),
  };
  const stripe = {
    isConfigured: jest.fn(() => options.configured ?? true),
    createCheckoutSession:
      options.createSession ??
      jest.fn(async () => ({
        id: "cs_test_1",
        url: "https://checkout.stripe.com/c/pay/cs_test_1",
      })),
    retrieveCheckout: jest.fn(async () => options.result ?? paidResult),
    constructEvent: jest.fn(),
  };
  const notifications = {
    stageForAdmins: jest.fn(async () => [{ id: "n-1" }]),
    deliverStaged: jest.fn(async () => undefined),
  };
  const emails = { sendPaid: jest.fn(async () => undefined) };
  const twilio = { isConfigured: jest.fn(() => true), send: jest.fn(async () => undefined) };
  const prisma = {
    auditLog: { create: jest.fn(async () => undefined) },
    $transaction: jest.fn(async (fn: (tx: unknown) => Promise<unknown>) => fn({})),
  };

  const service = new PaymentService(
    { priceForCustomer: jest.fn(async () => ({ basePrice: 100, total: 110 })) } as never,
    bookingRepository as never,
    paymentRepository as never,
    { nextBooking: async () => 1 } as never,
    prisma as never,
    notifications as never,
    { get: async () => ({ paymentMode: PaymentMode.TEST }) } as never,
    stripe as never,
    emails as never,
    twilio as never,
    {
      get: (key: string) => (key === "WEBSITE_URL" ? "https://www.usalimocorp.com/" : undefined),
    } as never,
    { error: jest.fn() } as never,
  );

  return { service, bookingRepository, paymentRepository, stripe, notifications, emails, twilio };
}

const flush = () => new Promise((resolve) => setImmediate(resolve));

describe("PaymentService.startCheckout", () => {
  it("refuses bookings when Stripe is not set up for the active mode", async () => {
    const { service, bookingRepository } = setup({ configured: false });

    await expect(service.startCheckout(body, request)).rejects.toThrow(
      "Online payment is not available",
    );
    expect(bookingRepository.create).not.toHaveBeenCalled();
  });

  it("saves a pending booking and returns the Stripe checkout page", async () => {
    const { service, bookingRepository, stripe } = setup();

    const result = await service.startCheckout(body, request);

    expect(bookingRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: null, status: BookingStatus.PENDING }),
    );
    expect(stripe.createCheckoutSession).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 110,
        successUrl:
          "https://www.usalimocorp.com/book-ride/payment-success?session_id={CHECKOUT_SESSION_ID}",
        cancelUrl: "https://www.usalimocorp.com/book-ride/payment-cancel",
      }),
    );
    expect(bookingRepository.attachCheckoutSession).toHaveBeenCalledWith("book-1", "cs_test_1");
    expect(result).toEqual({
      url: "https://checkout.stripe.com/c/pay/cs_test_1",
      sessionId: "cs_test_1",
      bookingNumber: "BK-000001",
    });
  });

  it("removes the booking when Stripe cannot open a checkout page", async () => {
    const { service, bookingRepository } = setup({
      createSession: jest.fn(async () => {
        throw new Error("Stripe down");
      }),
    });

    await expect(service.startCheckout(body, request)).rejects.toThrow("Stripe down");
    expect(bookingRepository.delete).toHaveBeenCalledWith("book-1");
  });
});

describe("PaymentService.handleWebhook", () => {
  const event = (type: string) => ({
    event: { type, data: { object: { id: "cs_test_1" } } },
    mode: PaymentMode.TEST,
  });

  it("rejects requests without a Stripe signature", async () => {
    const { service } = setup();

    await expect(service.handleWebhook(Buffer.from("{}"), undefined)).rejects.toThrow(
      "Missing Stripe signature",
    );
  });

  it("records the payment and tells the admin and the rider by email and SMS", async () => {
    const { service, paymentRepository, stripe, notifications, emails, twilio } = setup();
    stripe.constructEvent.mockReturnValue(event("checkout.session.completed"));

    await service.handleWebhook(Buffer.from("{}"), "sig");
    await flush();

    expect(stripe.retrieveCheckout).toHaveBeenCalledWith(PaymentMode.TEST, "cs_test_1");
    expect(paymentRepository.recordPaid).toHaveBeenCalledWith(
      expect.objectContaining({ id: "book-1", passenger }),
      paidResult,
      PaymentMode.TEST,
    );
    expect(notifications.stageForAdmins).toHaveBeenCalled();
    expect(emails.sendPaid).toHaveBeenCalledWith("book-1");
    expect(twilio.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "+17322898928",
        body: expect.stringContaining("BK-000001 is confirmed and paid ($110.00)"),
      }),
    );
  });

  it("sends nothing again when the payment was already recorded", async () => {
    const { service, stripe, emails, twilio } = setup({ recorded: false });
    stripe.constructEvent.mockReturnValue(event("checkout.session.completed"));

    await service.handleWebhook(Buffer.from("{}"), "sig");
    await flush();

    expect(emails.sendPaid).not.toHaveBeenCalled();
    expect(twilio.send).not.toHaveBeenCalled();
  });

  it("cancels the booking when the checkout page expires unpaid", async () => {
    const result = Object.assign({}, paidResult, { paid: false, expired: true });
    const { service, paymentRepository, stripe } = setup({ result });
    stripe.constructEvent.mockReturnValue(event("checkout.session.expired"));

    await service.handleWebhook(Buffer.from("{}"), "sig");

    expect(paymentRepository.recordCancelled).toHaveBeenCalled();
    expect(paymentRepository.recordPaid).not.toHaveBeenCalled();
  });

  it("ignores bookings that are no longer pending", async () => {
    const { service, stripe } = setup({ status: BookingStatus.CONFIRMED });
    stripe.constructEvent.mockReturnValue(event("checkout.session.completed"));

    await service.handleWebhook(Buffer.from("{}"), "sig");

    expect(stripe.retrieveCheckout).not.toHaveBeenCalled();
  });
});

describe("PaymentService.checkoutBooking", () => {
  it("settles a pending booking with Stripe before showing it", async () => {
    const { service, paymentRepository } = setup();

    const view = await service.checkoutBooking("cs_test_1");

    expect(paymentRepository.recordPaid).toHaveBeenCalled();
    expect(view.status).toBe(BookingStatus.CONFIRMED);
    expect(view.payment).toEqual(expect.objectContaining({ cardBrand: "visa", cardLast4: "4242" }));
  });
});
