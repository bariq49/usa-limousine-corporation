import { Inject, Injectable } from "@nestjs/common";
import { PLATFORM } from "@usa-limousine-corporation/config";
import { AppLogger } from "../../../common/logger/app.logger";
import { TwilioService } from "../../../infrastructure/twilio/twilio.service";
import { BookingRepository } from "../repositories/booking.repository";
import { sendBookingSms } from "../utils/send-booking-sms";

const BRAND = PLATFORM.name;
const SUPPORT_PHONE = PLATFORM.contact.phone;

@Injectable()
export class BookingSmsService {
  constructor(
    @Inject(BookingRepository) private readonly bookingRepository: BookingRepository,
    @Inject(TwilioService) private readonly twilio: TwilioService,
    @Inject(AppLogger) private readonly logger: AppLogger,
  ) {}

  sendPaid(bookingId: string) {
    return sendBookingSms({
      bookingId,
      kind: "paid",
      text: (booking) =>
        `${BRAND}: your booking ${booking.bookingNumber} is confirmed and paid ($${booking.total}). ` +
        `Pickup ${booking.pickup}. Details are in your email. Questions? Call ${SUPPORT_PHONE}.`,
      bookingRepository: this.bookingRepository,
      twilio: this.twilio,
      logger: this.logger,
      context: BookingSmsService.name,
    });
  }

  sendConfirmed(bookingId: string) {
    return sendBookingSms({
      bookingId,
      kind: "confirmed",
      text: (booking) =>
        `${BRAND}: your booking ${booking.bookingNumber} is confirmed. Pickup ${booking.pickup}. ` +
        `Questions? Call ${SUPPORT_PHONE}.`,
      bookingRepository: this.bookingRepository,
      twilio: this.twilio,
      logger: this.logger,
      context: BookingSmsService.name,
    });
  }

  sendCancelled(
    bookingId: string,
    reason: string | null,
    byCustomer = false,
  ) {
    return sendBookingSms({
      bookingId,
      kind: "cancelled",
      text: (booking) => {
        const prefix = byCustomer
          ? `${BRAND}: your booking ${booking.bookingNumber} has been cancelled.`
          : `${BRAND} has cancelled your booking ${booking.bookingNumber}.`;
        return (
          prefix +
          (reason ? ` Reason: ${reason}.` : "") +
          ` Questions? Call ${SUPPORT_PHONE}.`
        );
      },
      bookingRepository: this.bookingRepository,
      twilio: this.twilio,
      logger: this.logger,
      context: BookingSmsService.name,
    });
  }

  sendCompleted(bookingId: string) {
    return sendBookingSms({
      bookingId,
      kind: "completed",
      text: (booking) =>
        `${BRAND}: thank you for riding with us. Your trip ${booking.bookingNumber} is complete.`,
      bookingRepository: this.bookingRepository,
      twilio: this.twilio,
      logger: this.logger,
      context: BookingSmsService.name,
    });
  }
}
