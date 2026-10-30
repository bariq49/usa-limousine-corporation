import { BookingStatus, PaymentMode, PaymentStatus } from "@prisma/client";
import { BookingService } from "../src/modules/booking/services/booking.service";
import { CustomerBookingService } from "../src/modules/booking/services/customer-booking.service";

const request = { headers: {}, user: { sub: "customer-user", sid: "s1", roles: [] } } as never;
const inHours = (hours: number) => {
  const date = new Date(Date.now() + hours * 3_600_000);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "00";
  return {
    pickupDate: `${get("year")}-${get("month")}-${get("day")}`,
    pickupTime: `${get("hour")}:${get("minute")}`,
  };
};

function setup(options: { hoursToPickup: number; status?: BookingStatus; paid?: boolean }) {
  const booking = {
    id: "book-1",
    bookingNumber: "BK-000001",
    status: options.status ?? BookingStatus.CONFIRMED,
    bookingTime: inHours(options.hoursToPickup),
  };
  const repository = {
    findOwnedByUser: jest.fn(async () => booking),
    findById: jest.fn(async () => booking),
    updateStatus: jest.fn(async () =>
      Object.assign({}, booking, { status: BookingStatus.CANCELLED, cancellationReason: null }),
    ),
    findPaymentForRefund: jest.fn(async () =>
      options.paid === false
        ? null
        : {
            id: "pay-1",
            status: PaymentStatus.PAID,
            mode: PaymentMode.TEST,
            amount: { toNumber: () => 200 },
            squarePaymentId: "SQ-PAY",
          },
    ),
    recordRefund: jest.fn(async () => true),
  };
  const rates = {
    cancellationMinutes: 120,
    cancellationNotice: 2,
    cancellationNoticeUnit: "HOUR",
    cancellationRefundRate: 75,
  };
  const square = { refundPayment: jest.fn(async () => "REFUND-1") };
  const emails = {
    sendCancelled: jest.fn(async () => undefined),
    sendCompleted: jest.fn(async () => undefined),
  };
  const sms = {
    sendCancelled: jest.fn(async () => undefined),
    sendCompleted: jest.fn(async () => undefined),
  };
  const notifications = {
    cancelled: jest.fn(async () => undefined),
    created: jest.fn(async () => undefined),
    paid: jest.fn(async () => undefined),
  };
  const prisma = {
    auditLog: { create: jest.fn(async () => undefined) },
    $transaction: jest.fn(async (fn: (tx: unknown) => Promise<unknown>) => fn({})),
  };
  const bookingService = new BookingService(
    repository as never,
    prisma as never,
    notifications as never,
    emails as never,
    sms as never,
  );
  const service = new CustomerBookingService(
    repository as never,
    {} as never,
    prisma as never,
    notifications as never,
    { get: async () => rates } as never,
    {} as never,
    bookingService,
    emails as never,
  );
  return { service, repository, square, emails, sms, notifications };
}

describe("CustomerBookingService.cancel", () => {
  it("cancels booking without automatic Square refund and tells everyone", async () => {
    const { service, repository, square, emails, sms, notifications } = setup({
      hoursToPickup: 24,
    });

    await service.cancel("book-1", {}, request);

    expect(square.refundPayment).not.toHaveBeenCalled();
    expect(repository.recordRefund).not.toHaveBeenCalled();
    expect(repository.updateStatus).toHaveBeenCalledWith(
      "book-1",
      BookingStatus.CANCELLED,
      expect.anything(),
    );
    expect(emails.sendCancelled).toHaveBeenCalledWith({
      bookingId: "book-1",
      reason: null,
      refundAmount: 0,
      byCustomer: true,
    });
    expect(sms.sendCancelled).toHaveBeenCalledWith("book-1", null, true);
    expect(notifications.cancelled).toHaveBeenCalledWith(
      expect.objectContaining({
        bookingId: "book-1",
        bookingNumber: "BK-000001",
      }),
    );
  });

  it("refuses to cancel inside the cancellation window", async () => {
    const { service, square, repository } = setup({ hoursToPickup: 1 });

    await expect(service.cancel("book-1", {}, request)).rejects.toThrow(
      "at least 2 hours before pickup",
    );
    expect(square.refundPayment).not.toHaveBeenCalled();
    expect(repository.updateStatus).not.toHaveBeenCalled();
  });

  it("cancels unpaid bookings without a refund", async () => {
    const { service, square, emails } = setup({ hoursToPickup: 24, paid: false });

    await service.cancel("book-1", {}, request);

    expect(square.refundPayment).not.toHaveBeenCalled();
    expect(emails.sendCancelled).toHaveBeenCalledWith({
      bookingId: "book-1",
      reason: null,
      refundAmount: 0,
      byCustomer: true,
    });
  });
});

describe("CustomerBookingService.complete", () => {
  it("does not complete a ride before its pickup time", async () => {
    const { service } = setup({ hoursToPickup: 5 });

    await expect(service.complete("book-1", request)).rejects.toThrow("after the pickup time");
  });

  it("completes a confirmed ride after pickup", async () => {
    const { service, repository } = setup({ hoursToPickup: -1 });

    await service.complete("book-1", request);

    expect(repository.updateStatus).toHaveBeenCalledWith(
      "book-1",
      BookingStatus.COMPLETED,
      expect.objectContaining({ completedAt: expect.any(Date) }),
    );
  });
});
