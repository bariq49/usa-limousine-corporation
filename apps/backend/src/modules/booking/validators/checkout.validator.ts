import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { BookingStatus, PaymentPurpose } from "@prisma/client";
import { roundAmount } from "../../../common/utils/money";
import type { PurposeValidator } from "../../payment/types/checkout-validator";
import type { CheckoutInput } from "../../payment/types/payment";
import { BookingRepository } from "../repositories/booking.repository";
import { OfferRepository } from "../repositories/offer.repository";

@Injectable()
export class CheckoutValidator implements PurposeValidator {
  readonly purpose = PaymentPurpose.BOOKING;

  constructor(
    @Inject(BookingRepository) private readonly bookingRepository: BookingRepository,
    @Inject(OfferRepository) private readonly offerRepository: OfferRepository,
  ) {}

  async validate(input: CheckoutInput): Promise<void> {
    const booking = await this.bookingRepository.findById(input.referenceId);
    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    const allowed =
      booking.status === BookingStatus.DRAFT ||
      booking.status === BookingStatus.PENDING ||
      booking.status === BookingStatus.AWAITING_PAYMENT;

    if (!allowed) {
      throw new BadRequestException(`Booking cannot be paid while status is ${booking.status}`);
    }

    let expectedAmount: number;
    if (booking.status === BookingStatus.AWAITING_PAYMENT && booking.acceptedOfferId) {
      const offer = await this.offerRepository.findById(booking.acceptedOfferId);
      if (!offer) {
        throw new BadRequestException("Accepted offer not found for payment");
      }
      expectedAmount = roundAmount(offer.quotedPrice);
    } else {
      const pricing = booking.pricing as { total?: number };
      expectedAmount = roundAmount(pricing.total ?? NaN);
    }

    const actual = roundAmount(input.amount);

    if (!Number.isFinite(expectedAmount) || actual !== expectedAmount) {
      throw new BadRequestException("Payment amount does not match booking total");
    }
  }
}
