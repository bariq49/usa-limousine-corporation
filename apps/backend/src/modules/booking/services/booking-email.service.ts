import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppLogger } from "../../../common/logger/app.logger";
import { getEmailConfig } from "../../../infrastructure/email/email.config";
import { EmailService } from "../../../infrastructure/email/email.service";
import type { SendMailOptions } from "../../../infrastructure/email/types/mail";
import {
  bookingCancelled,
  bookingCompleted,
  bookingConfirmed,
  bookingReceived,
  newBookingAdmin,
} from "../emails/templates";
import type { BookingEmail, ContactPreferences, EmailContext } from "../emails/types";
import { toBookingEmail } from "../emails/view";
import { BookingRepository } from "../repositories/booking.repository";

const DEFAULT_WEBSITE_URL = "https://demo.usalimocorp.com";

@Injectable()
export class BookingEmailService {
  constructor(
    @Inject(BookingRepository) private readonly bookingRepository: BookingRepository,
    @Inject(EmailService) private readonly emailService: EmailService,
    @Inject(ConfigService) private readonly configService: ConfigService,
    @Inject(AppLogger) private readonly logger: AppLogger,
  ) {}

  sendCreated(bookingId: string) {
    return this.deliver(bookingId, "created", async (booking, context, prefs) => {
      await this.toCustomer(
        booking,
        prefs,
        `Booking request received · ${booking.bookingNumber}`,
        bookingReceived(booking, context),
      );
      await this.toAdmin(
        booking,
        `New booking · ${booking.bookingNumber}`,
        newBookingAdmin(booking, context),
      );
    });
  }

  sendPaid(bookingId: string) {
    return this.deliver(bookingId, "paid", async (booking, context, prefs) => {
      await this.toCustomer(
        booking,
        prefs,
        `Booking confirmed · ${booking.bookingNumber}`,
        bookingConfirmed(booking, context, true),
      );
      await this.toAdmin(
        booking,
        `New paid booking · ${booking.bookingNumber}`,
        newBookingAdmin(booking, context, true),
      );
    });
  }

  sendConfirmed(bookingId: string) {
    return this.deliver(bookingId, "confirmed", (booking, context, prefs) =>
      this.toCustomer(
        booking,
        prefs,
        `Booking confirmed · ${booking.bookingNumber}`,
        bookingConfirmed(booking, context),
      ),
    );
  }

  sendCancelled(bookingId: string, reason: string | null) {
    return this.deliver(bookingId, "cancelled", (booking, context, prefs) =>
      this.toCustomer(
        booking,
        prefs,
        `Booking cancelled · ${booking.bookingNumber}`,
        bookingCancelled(booking, context, reason),
      ),
    );
  }

  sendCompleted(bookingId: string) {
    return this.deliver(bookingId, "completed", (booking, context, prefs) =>
      this.toCustomer(
        booking,
        prefs,
        `Ride completed · ${booking.bookingNumber}`,
        bookingCompleted(booking, context),
      ),
    );
  }

  private async deliver(
    bookingId: string,
    kind: string,
    send: (
      booking: BookingEmail,
      context: EmailContext,
      prefs: ContactPreferences,
    ) => Promise<unknown>,
  ) {
    try {
      const row = await this.bookingRepository.findById(bookingId);
      if (!row) return;
      const prefs = await this.bookingRepository.contactPreferences(row.userId);
      await send(toBookingEmail(row), this.context(), prefs);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      this.logger.error(
        `Booking ${kind} email failed for ${bookingId}: ${message}`,
        undefined,
        BookingEmailService.name,
      );
    }
  }

  private async toCustomer(
    booking: BookingEmail,
    prefs: ContactPreferences,
    subject: string,
    html: string,
  ) {
    if (!prefs.email) return undefined;
    const mail: SendMailOptions = {
      to: booking.passenger.email,
      subject: `${subject} - USA Limousine`,
      html,
    };
    if (booking.passenger.ccEmail) {
      mail.cc = booking.passenger.ccEmail;
    }
    return this.emailService.send(mail);
  }

  private toAdmin(booking: BookingEmail, subject: string, html: string) {
    const adminEmail = getEmailConfig(this.configService).defaultAdminEmail;
    if (!adminEmail) return;
    return this.emailService.send({
      to: adminEmail,
      replyTo: booking.passenger.email,
      subject: `${subject} - ${booking.passenger.name}`,
      html,
    });
  }

  private context(): EmailContext {
    const trimSlash = (url: string) => url.replace(/\/+$/, "");
    const siteUrl = trimSlash(this.configService.get<string>("WEBSITE_URL") ?? DEFAULT_WEBSITE_URL);

    return {
      siteUrl,
      portalUrl: trimSlash(this.configService.get<string>("CUSTOMER_APP_URL") ?? siteUrl),
      reviewUrl: this.configService.get<string>("GOOGLE_REVIEW_URL"),
    };
  }
}
