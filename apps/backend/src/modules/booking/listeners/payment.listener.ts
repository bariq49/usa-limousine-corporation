import { Inject, Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { BookingStatus, PaymentPurpose } from "@prisma/client";
import type { EventPayload } from "../../payment/types/events";
import { BookingRepository } from "../repositories/booking.repository";
import { BookingService } from "../services/booking.service";
import { OfferService } from "../services/offer.service";

@Injectable()
export class BookingPaymentListener {
  constructor(
    @Inject(BookingService) private readonly bookingService: BookingService,
    @Inject(OfferService) private readonly offerService: OfferService,
    @Inject(BookingRepository) private readonly bookings: BookingRepository,
  ) {}

  @OnEvent("payment.succeeded")
  async onPaymentSucceeded(payload: EventPayload) {
    if (payload.purpose !== PaymentPurpose.BOOKING) {
      return;
    }

    const booking = await this.bookings.findById(payload.referenceId);
    if (!booking) {
      return;
    }

    if (booking.acceptedOfferId || booking.status === BookingStatus.AWAITING_PAYMENT) {
      await this.offerService.onMarketplacePaid(payload.referenceId);
      return;
    }

    await this.bookingService.onPaid(payload.referenceId);
  }

  @OnEvent("payment.failed")
  async onPaymentFailed(payload: EventPayload) {
    if (payload.purpose !== PaymentPurpose.BOOKING) {
      return;
    }

    const booking = await this.bookings.findById(payload.referenceId);
    if (!booking) {
      return;
    }

    if (booking.status === BookingStatus.AWAITING_PAYMENT || booking.acceptedOfferId) {
      await this.offerService.onPaymentFailed(payload.referenceId);
      return;
    }

    await this.bookingService.onPaymentFailed(payload.referenceId);
  }
}
