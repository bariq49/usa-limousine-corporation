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
import type { BookingEmail, EmailContext } from "../emails/types";
import { BookingRepository } from "../repositories/booking.repository";
import type {
  AddressInput,
  FlightDetailsInput,
  MeetAndGreetInput,
  PassengerInput,
  TimeInput,
} from "../types/booking";

const DEFAULT_WEBSITE_URL = "https://www.usalimocorp.com";

/**
 * Booking emails to the rider (copied to their CC address) and the admin inbox.
 * Sending never throws: a mail outage must not fail or roll back the booking itself.
 */
@Injectable()
export class BookingEmailService {
  constructor(
    @Inject(BookingRepository) private readonly bookingRepository: BookingRepository,
    @Inject(EmailService) private readonly emailService: EmailService,
    @Inject(ConfigService) private readonly configService: ConfigService,
    @Inject(AppLogger) private readonly logger: AppLogger,
  ) {}

  /** New customer booking: "request received" to the rider and a heads-up to the admin. */
  sendCreated(bookingId: string) {
    return this.deliver(bookingId, "created", async (booking, context) => {
      await this.toCustomer(
        booking,
        `Booking request received · ${booking.bookingNumber}`,
        bookingReceived(booking, context),
      );

      const adminEmail = getEmailConfig(this.configService).defaultAdminEmail;
      if (adminEmail) {
        await this.emailService.send({
          to: adminEmail,
          replyTo: booking.passenger.email,
          subject: `New booking · ${booking.bookingNumber} - ${booking.passenger.name}`,
          html: newBookingAdmin(booking, context),
        });
      }
    });
  }

  sendConfirmed(bookingId: string) {
    return this.deliver(bookingId, "confirmed", (booking, context) =>
      this.toCustomer(
        booking,
        `Booking confirmed · ${booking.bookingNumber}`,
        bookingConfirmed(booking, context),
      ),
    );
  }

  sendCancelled(bookingId: string, reason: string | null) {
    return this.deliver(bookingId, "cancelled", (booking, context) =>
      this.toCustomer(
        booking,
        `Booking cancelled · ${booking.bookingNumber}`,
        bookingCancelled(booking, context, reason),
      ),
    );
  }

  sendCompleted(bookingId: string) {
    return this.deliver(bookingId, "completed", (booking, context) =>
      this.toCustomer(
        booking,
        `Ride completed · ${booking.bookingNumber}`,
        bookingCompleted(booking, context),
      ),
    );
  }

  private async deliver(
    bookingId: string,
    kind: string,
    send: (booking: BookingEmail, context: EmailContext) => Promise<unknown>,
  ) {
    try {
      const row = await this.bookingRepository.findById(bookingId);
      if (!row) return;
      await send(toBookingEmail(row), this.context());
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      this.logger.error(
        `Booking ${kind} email failed for ${bookingId}: ${message}`,
        undefined,
        BookingEmailService.name,
      );
    }
  }

  private toCustomer(booking: BookingEmail, subject: string, html: string) {
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

type BookingRow = NonNullable<Awaited<ReturnType<BookingRepository["findById"]>>>;

/** Flattens the stored booking (JSON columns and line items) for the templates. */
function toBookingEmail(row: BookingRow): BookingEmail {
  const address = row.address as AddressInput;
  const passenger = row.passenger as PassengerInput;
  const time = row.bookingTime as TimeInput;
  const flight = (row.flightDetails ?? {}) as FlightDetailsInput;
  const meetAndGreet = (row.meetAndGreet ?? {}) as MeetAndGreetInput;

  return {
    id: row.id,
    bookingNumber: row.bookingNumber,
    bookingType: row.bookingType,
    vehicleCount: row.vehicleCount,
    vehicle: {
      name: row.vehicleCategory.name,
      description: row.vehicleCategory.description,
      image: row.vehicleCategory.image,
      passengerCount: row.vehicleCategory.passengerCount,
    },
    pickupAddress: address.pickup.address,
    dropoffAddress: address.dropoff?.address ?? null,
    stops: (address.stops ?? []).map((stop) => stop.address),
    distance: address.distance,
    duration: address.duration,
    pickupDate: time.pickupDate,
    pickupTime: time.pickupTime,
    returnDate: time.returnDate ?? null,
    returnTime: time.returnTime ?? null,
    passenger: {
      name: passenger.name,
      email: passenger.email,
      phone: passenger.phone,
      ccEmail: passenger.ccEmail ?? null,
      passengerCount: passenger.passengerCount,
    },
    flight: { airline: flight.flightName ?? null, number: flight.flightNumber ?? null },
    meetAndGreet: {
      enabled: Boolean(meetAndGreet.enabled),
      returnEnabled: Boolean(meetAndGreet.returnEnabled),
      signName: meetAndGreet.signName ?? null,
    },
    luggage: row.luggage.map((item) => ({ name: item.luggageType.name, quantity: item.quantity })),
    extras: row.extraServices.map((item) => ({
      name: item.extraService.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice.toNumber(),
    })),
    notes: row.notes,
    pricing: row.pricing as BookingEmail["pricing"],
  };
}
