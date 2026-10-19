import { BookingStatus, PaymentPurpose, PaymentStatus } from "@prisma/client";
import { BookingPaymentListener } from "../src/modules/booking/listeners/payment.listener";
import type { BookingRepository } from "../src/modules/booking/repositories/booking.repository";
import type { BookingService } from "../src/modules/booking/services/booking.service";
import type { OfferService } from "../src/modules/booking/services/offer.service";

describe("BookingPaymentListener", () => {
  it("confirms booking on payment.succeeded for BOOKING purpose (prepaid)", async () => {
    const onPaid = jest.fn(async () => undefined);
    const onMarketplacePaid = jest.fn(async () => undefined);
    const listener = new BookingPaymentListener(
      { onPaid } as unknown as BookingService,
      { onMarketplacePaid } as unknown as OfferService,
      {
        findById: async () => ({
          id: "book1",
          status: BookingStatus.PENDING,
          acceptedOfferId: null,
        }),
      } as unknown as BookingRepository,
    );

    await listener.onPaymentSucceeded({
      id: "pay1",
      purpose: PaymentPurpose.BOOKING,
      referenceId: "book1",
      status: PaymentStatus.SUCCEEDED,
    });

    expect(onPaid).toHaveBeenCalledWith("book1");
    expect(onMarketplacePaid).not.toHaveBeenCalled();
  });

  it("routes marketplace payments to OfferService", async () => {
    const onPaid = jest.fn(async () => undefined);
    const onMarketplacePaid = jest.fn(async () => undefined);
    const listener = new BookingPaymentListener(
      { onPaid } as unknown as BookingService,
      { onMarketplacePaid } as unknown as OfferService,
      {
        findById: async () => ({
          id: "book1",
          status: BookingStatus.AWAITING_PAYMENT,
          acceptedOfferId: "offer1",
        }),
      } as unknown as BookingRepository,
    );

    await listener.onPaymentSucceeded({
      id: "pay1",
      purpose: PaymentPurpose.BOOKING,
      referenceId: "book1",
      status: PaymentStatus.SUCCEEDED,
    });

    expect(onMarketplacePaid).toHaveBeenCalledWith("book1");
    expect(onPaid).not.toHaveBeenCalled();
  });

  it("ignores non-booking payment.succeeded", async () => {
    const onPaid = jest.fn(async () => undefined);
    const listener = new BookingPaymentListener(
      { onPaid } as unknown as BookingService,
      { onMarketplacePaid: jest.fn() } as unknown as OfferService,
      { findById: async () => null } as unknown as BookingRepository,
    );

    await listener.onPaymentSucceeded({
      id: "pay1",
      purpose: PaymentPurpose.DRIVER_SUBSCRIPTION,
      referenceId: "sub1",
      status: PaymentStatus.SUCCEEDED,
    });

    expect(onPaid).not.toHaveBeenCalled();
  });

  it("reverts booking on payment.failed for BOOKING purpose", async () => {
    const onPaymentFailed = jest.fn(async () => undefined);
    const offerFailed = jest.fn(async () => undefined);
    const listener = new BookingPaymentListener(
      { onPaymentFailed } as unknown as BookingService,
      { onPaymentFailed: offerFailed } as unknown as OfferService,
      {
        findById: async () => ({
          id: "book1",
          status: BookingStatus.PENDING,
          acceptedOfferId: null,
        }),
      } as unknown as BookingRepository,
    );

    await listener.onPaymentFailed({
      id: "pay1",
      purpose: PaymentPurpose.BOOKING,
      referenceId: "book1",
      status: PaymentStatus.FAILED,
    });

    expect(onPaymentFailed).toHaveBeenCalledWith("book1");
  });
});
