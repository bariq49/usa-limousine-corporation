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
const ORDER_ID = "ORDER123456789";

const paidOrder = {
  orderId: ORDER_ID,
  paid: true,
  paymentId: "PAY123",
  amount: 110,
  currency: "usd",
  cardBrand: "VISA",
  cardLast4: "4242",
};

function setup(
  options: {
    configured?: boolean;
    status?: BookingStatus;
    order?: typeof paidOrder;
    recorded?: boolean;
    createLink?: jest.Mock;
    customerId?: string | null;
  } = {},
) {
  const bookingRepository = {
    findCustomerIdByEmail: jest.fn(async () => options.customerId ?? null),
    create: jest.fn(async () => ({ id: "book-1", bookingNumber: "BK-1" })),
    attachPaymentLink: jest.fn(async () => undefined),
    delete: jest.fn(async () => undefined),
    findByOrderId: jest.fn(async () => ({
      id: "book-1",
      status: options.status ?? BookingStatus.PENDING,
      bookingNumber: "BK-000001",
      passenger,
      paymentMode: PaymentMode.TEST,
      squarePaymentLinkId: "LINK1",
    })),
    findUnpaidCheckouts: jest.fn(async () => [{ squareOrderId: ORDER_ID }]),
    findById: jest.fn(async () => ({
      id: "book-1",
      status: BookingStatus.CONFIRMED,
      totalPrice: { toFixed: () => "110.00" },
      bookingTime: { pickupDate: "2030-09-11", pickupTime: "14:00" },
      payment: { status: PaymentStatus.PAID, cardBrand: "VISA", cardLast4: "4242" },
    })),
  };
  const paymentRepository = {
    recordPaid: jest.fn(async () => options.recorded ?? true),
    recordCancelled: jest.fn(async () => true),
  };
  const square = {
    isConfigured: jest.fn(() => options.configured ?? true),
    createPaymentLink:
      options.createLink ??
      jest.fn(async () => ({ id: "LINK1", orderId: ORDER_ID, url: "https://square.link/u/abc" })),
    retrieveOrder: jest.fn(async () => options.order ?? paidOrder),
    deletePaymentLink: jest.fn(async () => undefined),
    verifyWebhook: jest.fn(async () => PaymentMode.TEST),
  };
  const notifications = {
    stageForAdmins: jest.fn(async () => [{ id: "n-1" }]),
    deliverStaged: jest.fn(async () => undefined),
  };
  const emails = { sendPaid: jest.fn(async () => undefined) };
  const sms = { sendPaid: jest.fn(async () => undefined) };
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
    square as never,
    emails as never,
    sms as never,
    {
      get: (key: string) => (key === "WEBSITE_URL" ? "https://www.usalimocorp.com/" : undefined),
    } as never,
    { error: jest.fn() } as never,
  );

  return { service, bookingRepository, paymentRepository, square, notifications, emails, sms };
}

const flush = () => new Promise((resolve) => setImmediate(resolve));
const webhook = (type: string) =>
  Buffer.from(JSON.stringify({ type, data: { object: { payment: { order_id: ORDER_ID } } } }));

describe("PaymentService.startCheckout", () => {
  it("refuses bookings when Square is not set up for the active mode", async () => {
    const { service, bookingRepository } = setup({ configured: false });

    await expect(service.startCheckout(body, request)).rejects.toThrow(
      "Online payment is not available",
    );
    expect(bookingRepository.create).not.toHaveBeenCalled();
  });

  it("saves a pending booking and returns the Square checkout page", async () => {
    const { service, bookingRepository, square } = setup();

    const result = await service.startCheckout(body, request);

    expect(bookingRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: null, status: BookingStatus.PENDING }),
    );
    expect(square.createPaymentLink).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 110,
        customerPhone: "+17322898928",
        redirectUrl: "https://www.usalimocorp.com/book-ride/payment-success",
      }),
    );
    expect(bookingRepository.attachPaymentLink).toHaveBeenCalledWith(
      "book-1",
      expect.objectContaining({ orderId: ORDER_ID }),
      PaymentMode.TEST,
    );
    expect(result).toEqual({
      url: "https://square.link/u/abc",
      orderId: ORDER_ID,
      bookingNumber: "BK-000001",
    });
  });

  it("files the booking under the rider's account when their email has one", async () => {
    const { service, bookingRepository } = setup({ customerId: "user-7" });

    await service.startCheckout(body, request);

    expect(bookingRepository.findCustomerIdByEmail).toHaveBeenCalledWith("ada@example.com");
    expect(bookingRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "user-7" }),
    );
  });

  it("removes the booking when Square cannot open a checkout page", async () => {
    const { service, bookingRepository } = setup({
      createLink: jest.fn(async () => {
        throw new Error("Square down");
      }),
    });

    await expect(service.startCheckout(body, request)).rejects.toThrow("Square down");
    expect(bookingRepository.delete).toHaveBeenCalledWith("book-1");
  });
});

describe("PaymentService.handleWebhook", () => {
  it("rejects requests without a Square signature", async () => {
    const { service } = setup();

    await expect(service.handleWebhook(webhook("payment.updated"), undefined)).rejects.toThrow(
      "Missing Square signature",
    );
  });

  it("records the payment and tells the admin and the rider by email and SMS", async () => {
    const { service, paymentRepository, square, notifications, emails, sms } = setup();

    await service.handleWebhook(webhook("payment.updated"), "sig");
    await flush();

    expect(square.retrieveOrder).toHaveBeenCalledWith(PaymentMode.TEST, ORDER_ID);
    expect(paymentRepository.recordPaid).toHaveBeenCalledWith(
      expect.objectContaining({ id: "book-1", passenger }),
      paidOrder,
      PaymentMode.TEST,
    );
    expect(notifications.stageForAdmins).toHaveBeenCalled();
    expect(emails.sendPaid).toHaveBeenCalledWith("book-1");
    expect(sms.sendPaid).toHaveBeenCalledWith("book-1");
  });

  it("sends nothing again when the payment was already recorded", async () => {
    const { service, emails, sms } = setup({ recorded: false });

    await service.handleWebhook(webhook("payment.updated"), "sig");
    await flush();

    expect(emails.sendPaid).not.toHaveBeenCalled();
    expect(sms.sendPaid).not.toHaveBeenCalled();
  });

  it("leaves an unpaid order open until it expires", async () => {
    const order = Object.assign({}, paidOrder, { paid: false, paymentId: null });
    const { service, paymentRepository } = setup({ order });

    await service.handleWebhook(webhook("payment.created"), "sig");

    expect(paymentRepository.recordPaid).not.toHaveBeenCalled();
    expect(paymentRepository.recordCancelled).not.toHaveBeenCalled();
  });

  it("ignores bookings that are no longer pending", async () => {
    const { service, square } = setup({ status: BookingStatus.CONFIRMED });

    await service.handleWebhook(webhook("payment.updated"), "sig");

    expect(square.retrieveOrder).not.toHaveBeenCalled();
  });
});

describe("PaymentService.releaseExpiredCheckouts", () => {
  it("cancels unpaid checkouts older than 30 minutes and deletes their payment link", async () => {
    const order = Object.assign({}, paidOrder, { paid: false, paymentId: null });
    const { service, square, paymentRepository } = setup({ order });

    await service.releaseExpiredCheckouts();

    expect(square.deletePaymentLink).toHaveBeenCalledWith(PaymentMode.TEST, "LINK1");
    expect(paymentRepository.recordCancelled).toHaveBeenCalled();
  });

  it("records the payment instead when the expired checkout was actually paid", async () => {
    const { service, square, paymentRepository } = setup();

    await service.releaseExpiredCheckouts();

    expect(paymentRepository.recordPaid).toHaveBeenCalled();
    expect(square.deletePaymentLink).not.toHaveBeenCalled();
  });
});

describe("PaymentService.checkoutBooking", () => {
  it("settles a pending booking with Square before showing it", async () => {
    const { service, paymentRepository } = setup();

    const booking = await service.checkoutBooking(ORDER_ID);

    expect(paymentRepository.recordPaid).toHaveBeenCalled();
    expect(booking.status).toBe(BookingStatus.CONFIRMED);
  });
});
