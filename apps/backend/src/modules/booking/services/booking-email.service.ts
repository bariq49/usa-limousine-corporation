import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PLATFORM } from "@usa-limousine-corporation/config";
import { AppLogger } from "../../../common/logger/app.logger";
import { getEmailConfig } from "../../../infrastructure/email/email.config";
import { EmailService } from "../../../infrastructure/email/email.service";
import { bookingCancelled } from "../../../infrastructure/email/templates/booking/cancelled";
import { bookingCompleted } from "../../../infrastructure/email/templates/booking/completed";
import { bookingConfirmed } from "../../../infrastructure/email/templates/booking/confirmed";
import { bookingReceived } from "../../../infrastructure/email/templates/booking/received";
import type { SendMailOptions } from "../../../infrastructure/email/types/mail";
import { BookingRepository } from "../repositories/booking.repository";
import type {
  AdminMailProps,
  CancelEmailProps,
  ContactPreferences,
  CustomerMailProps,
  DeliverProps,
  EmailContext,
} from "../types/email";
import { toBookingEmail } from "../utils/booking-email-view";

@Injectable()
export class BookingEmailService {
  constructor(
    @Inject(BookingRepository) private readonly bookingRepository: BookingRepository,
    @Inject(EmailService) private readonly emailService: EmailService,
    @Inject(ConfigService) private readonly configService: ConfigService,
    @Inject(AppLogger) private readonly logger: AppLogger,
  ) {}

  sendCreated(bookingId: string) {
    return this.deliver({
      bookingId,
      kind: "created",
      send: async ({ booking, context, prefs }) => {
        await this.toCustomer({
          booking,
          prefs,
          subject: `Booking request received · ${booking.bookingNumber}`,
          html: bookingReceived({ booking, ...context }),
        });
        await this.toAdmin({
          booking,
          subject: `New booking · ${booking.bookingNumber}`,
          html: bookingConfirmed({ booking, ...context, admin: true }),
        });
      },
    });
  }

  sendPaid(bookingId: string) {
    return this.deliver({
      bookingId,
      kind: "paid",
      send: async ({ booking, context, prefs }) => {
        await this.toCustomer({
          booking,
          prefs,
          subject: `Booking confirmed · ${booking.bookingNumber}`,
          html: bookingConfirmed({ booking, ...context, paid: true }),
        });
        await this.toAdmin({
          booking,
          subject: `New paid booking · ${booking.bookingNumber}`,
          html: bookingConfirmed({ booking, ...context, paid: true, admin: true }),
        });
      },
    });
  }

  sendConfirmed(bookingId: string) {
    return this.deliver({
      bookingId,
      kind: "confirmed",
      send: ({ booking, context, prefs }) =>
        this.toCustomer({
          booking,
          prefs,
          subject: `Booking confirmed · ${booking.bookingNumber}`,
          html: bookingConfirmed({ booking, ...context }),
        }),
    });
  }

  sendCancelled(props: CancelEmailProps) {
    const { bookingId, reason, refundAmount, byCustomer } = props;
    return this.deliver({
      bookingId,
      kind: "cancelled",
      send: async ({ booking, context, prefs }) => {
        await this.toCustomer({
          booking,
          prefs,
          subject: `Booking cancelled · ${booking.bookingNumber}`,
          html: bookingCancelled({
            booking,
            siteUrl: context.siteUrl,
            reason,
            refundAmount,
          }),
        });
        if (byCustomer) {
          await this.toAdmin({
            booking,
            subject: `Booking cancelled by customer · ${booking.bookingNumber}`,
            html: bookingCancelled({
              booking,
              siteUrl: context.siteUrl,
              reason,
              refundAmount,
              admin: true,
            }),
          });
        }
      },
    });
  }

  sendCompleted(bookingId: string) {
    return this.deliver({
      bookingId,
      kind: "completed",
      send: ({ booking, context, prefs }) =>
        this.toCustomer({
          booking,
          prefs,
          subject: `Ride completed · ${booking.bookingNumber}`,
          html: bookingCompleted({ booking, ...context }),
        }),
    });
  }

  async deliver(props: DeliverProps) {
    const { bookingId, kind, send } = props;
    try {
      const row = await this.bookingRepository.findById(bookingId);
      if (!row) return;
      const account = await this.bookingRepository.contactPreferences(row.userId);
      const prefs: ContactPreferences = {
        email: account.email && row.notifyByEmail,
        sms: account.sms && row.notifyBySms,
      };
      await send({ booking: toBookingEmail(row), context: this.context(), prefs });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      this.logger.error(
        `Booking ${kind} email failed for ${bookingId}: ${message}`,
        undefined,
        BookingEmailService.name,
      );
    }
  }

  async toCustomer(props: CustomerMailProps) {
    const { booking, prefs, subject, html } = props;
    if (!prefs.email) return undefined;
    const mail: SendMailOptions = {
      to: booking.passenger.email,
      subject: `${subject} - ${PLATFORM.shortName}`,
      html,
    };
    if (
      booking.passenger.ccEmail &&
      booking.passenger.ccEmail.toLowerCase() !== booking.passenger.email.toLowerCase()
    ) {
      mail.cc = booking.passenger.ccEmail;
    }
    return this.emailService.send(mail);
  }

  toAdmin(props: AdminMailProps) {
    const { booking, subject, html } = props;
    const adminEmail = getEmailConfig(this.configService).defaultAdminEmail;
    if (!adminEmail) return;
    return this.emailService.send({
      to: adminEmail,
      replyTo: booking.passenger.email,
      subject: `${subject} - ${booking.passenger.name}`,
      html,
    });
  }

  context(): EmailContext {
    return {
      siteUrl: this.configService.getOrThrow<string>("WEBSITE_URL").replace(/\/+$/, ""),
      reviewUrl: this.configService.get<string>("GOOGLE_REVIEW_URL"),
    };
  }
}
