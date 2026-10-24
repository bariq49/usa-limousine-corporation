import { BookingStatus, PaymentMode, PaymentStatus } from "@prisma/client";
import { BookingService } from "../src/modules/booking/services/booking.service";

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
    stageForAdmins: jest.fn(async () => [{ id: "n-1" }]),
    deliverStaged: jest.fn(async () => undefined),
  };
  const prisma = {
    auditLog: { create: jest.fn(async () => undefined) },
    $transaction: jest.fn(async (fn: (tx: unknown) => Promise<unknown>) => fn({})),
  };
  const service = new BookingService(
    repository as never,
    {} as never,
    prisma as never,
    notifications as never,
    { get: async () => rates } as never,
    {} as never,
    emails as never,
    sms as never,
    square as never,
  );
  return { service, repository, square, emails, sms, notifications };
}

describe("BookingService.cancelForCustomer", () => {
  it("refunds the set percentage through Square and tells everyone", async () => {
    const { service, repository, square, emails, sms, notifications } = setup({
      hoursToPickup: 24,
    });

    await service.cancelForCustomer("book-1", {}, request);

    expect(square.refundPayment).toHaveBeenCalledWith(
      PaymentMode.TEST,
      "SQ-PAY",
      150,
      expect.stringContaining("BK-000001"),
    );
    expect(repository.recordRefund).toHaveBeenCalledWith("pay-1", 150, "REFUND-1");
    expect(repository.updateStatus).toHaveBeenCalledWith(
      "book-1",
      BookingStatus.CANCELLED,
      expect.anything(),
    );
    expect(emails.sendCancelled).toHaveBeenCalledWith("book-1", null, {
      refundAmount: 150,
      byCustomer: true,
    });
    expect(sms.sendCancelled).toHaveBeenCalledWith("book-1", null, 150);
    expect(notifications.stageForAdmins).toHaveBeenCalledWith(
      expect.objectContaining({ idempotencyKey: "BOOKING_CANCELLED:book-1" }),
      {},
    );
  });

  it("refuses to cancel inside the cancellation window", async () => {
    const { service, square, repository } = setup({ hoursToPickup: 1 });

    await expect(service.cancelForCustomer("book-1", {}, request)).rejects.toThrow(
      "up to 2 hours before pickup",
    );
    expect(square.refundPayment).not.toHaveBeenCalled();
    expect(repository.updateStatus).not.toHaveBeenCalled();
  });

  it("cancels unpaid bookings without a refund", async () => {
    const { service, square, emails } = setup({ hoursToPickup: 24, paid: false });

    await service.cancelForCustomer("book-1", {}, request);

    expect(square.refundPayment).not.toHaveBeenCalled();
    expect(emails.sendCancelled).toHaveBeenCalledWith("book-1", null, {
      refundAmount: 0,
      byCustomer: true,
    });
  });
});

describe("BookingService.completeForCustomer", () => {
  it("does not complete a ride before its pickup time", async () => {
    const { service } = setup({ hoursToPickup: 5 });

    await expect(service.completeForCustomer("book-1", request)).rejects.toThrow(
      "after the pickup time",
    );
  });

  it("completes a confirmed ride after pickup", async () => {
    const { service, repository } = setup({ hoursToPickup: -1 });

    await service.completeForCustomer("book-1", request);

    expect(repository.updateStatus).toHaveBeenCalledWith(
      "book-1",
      BookingStatus.COMPLETED,
      expect.objectContaining({ completedAt: expect.any(Date) }),
    );
  });
});
