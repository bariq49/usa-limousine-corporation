import { Inject, Injectable } from "@nestjs/common";
import { AppLogger } from "../../../common/logger/app.logger";
import { TwilioService } from "../../../infrastructure/twilio/twilio.service";
import { formatDate, formatTime } from "../../../infrastructure/email/templates/booking/cards";
import { BookingRepository } from "../repositories/booking.repository";
import type { PassengerInput, TimeInput } from "../types/booking";
import { PLATFORM } from "@usa-limousine-corporation/config";

const BRAND = PLATFORM.name;
const SUPPORT_PHONE = PLATFORM.contact.phone;

type SmsBooking = {
  bookingNumber: string;
  pickup: string;
  total: string;
};

@Injectable()
export class BookingSmsService {
  constructor(
    @Inject(BookingRepository) private readonly bookingRepository: BookingRepository,
    @Inject(TwilioService) private readonly twilio: TwilioService,
    @Inject(AppLogger) private readonly logger: AppLogger,
  ) {}

  sendPaid(bookingId: string) {
    return this.deliver(
      bookingId,
      "paid",
      (booking) =>
        `${BRAND}: your booking ${booking.bookingNumber} is confirmed and paid ($${booking.total}). ` +
        `Pickup ${booking.pickup}. Details are in your email. Questions? Call ${SUPPORT_PHONE}.`,
    );
  }

  sendConfirmed(bookingId: string) {
    return this.deliver(
      bookingId,
      "confirmed",
      (booking) =>
        `${BRAND}: your booking ${booking.bookingNumber} is confirmed. Pickup ${booking.pickup}. ` +
        `Questions? Call ${SUPPORT_PHONE}.`,
    );
  }

  sendCancelled(bookingId: string, reason: string | null, refundAmount = 0) {
    return this.deliver(
      bookingId,
      "cancelled",
      (booking) =>
        `${BRAND}: your booking ${booking.bookingNumber} has been cancelled.` +
        (reason ? ` Reason: ${reason}.` : "") +
        (refundAmount > 0
          ? ` A refund of $${refundAmount.toFixed(2)} is on its way to your card.`
          : "") +
        ` Questions? Call ${SUPPORT_PHONE}.`,
    );
  }

  sendCompleted(bookingId: string) {
    return this.deliver(
      bookingId,
      "completed",
      (booking) =>
        `${BRAND}: thank you for riding with us. Your trip ${booking.bookingNumber} is complete.`,
    );
  }

  private async deliver(bookingId: string, kind: string, text: (booking: SmsBooking) => string) {
    if (!this.twilio.isConfigured()) return;

    try {
      const row = await this.bookingRepository.findById(bookingId);
      const phone = row ? (row.passenger as PassengerInput).phone : null;
      if (!row || !phone) return;

      const prefs = await this.bookingRepository.contactPreferences(row.userId);
      if (!prefs.sms || !row.notifyBySms) return;

      const time = row.bookingTime as TimeInput;
      await this.twilio.send({
        to: phone,
        body: text({
          bookingNumber: row.bookingNumber,
          pickup: `${formatDate(time.pickupDate)} at ${formatTime(time.pickupTime)}`,
          total: row.totalPrice.toFixed(2),
        }),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      this.logger.error(
        `Booking ${kind} SMS failed for ${bookingId}: ${message}`,
        undefined,
        BookingSmsService.name,
      );
    }
  }
}
