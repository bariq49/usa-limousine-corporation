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
import type { BookingEmail } from "../../../infrastructure/email/types/booking";
import type { SendMailOptions } from "../../../infrastructure/email/types/mail";
import { BookingRepository } from "../repositories/booking.repository";
import type {
  AddressInput,
  FlightDetailsInput,
  MeetAndGreetInput,
  PassengerInput,
  TimeInput,
} from "../types/booking";
import type {
  AdminMailProps,
  CancelEmailProps,
  ContactPreferences,
  CustomerMailProps,
  DeliverProps,
  EmailContext,
} from "../types/email";

type BookingRow = NonNullable<Awaited<ReturnType<BookingRepository["findById"]>>>;

@Injectable()
export class BookingEmailService {
  constructor(
    @Inject(BookingRepository) private readonly bookingRepository: BookingRepository,
    @Inject(EmailService) private readonly emailService: EmailService,
    @Inject(ConfigService) private readonly configService: ConfigService,
    @Inject(AppLogger) private readonly logger: AppLogger,
  ) {}

  toBookingEmail(row: BookingRow): BookingEmail {
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
      travelDuration: address.travelDuration,
      hourlyDuration: address.hourlyDuration ?? null,
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
      flight: { number: flight.flightNumber ?? null },
      meetAndGreet: {
        enabled: Boolean(meetAndGreet.enabled),
        returnEnabled: Boolean(meetAndGreet.returnEnabled),
        signName: meetAndGreet.signName ?? null,
      },
      luggage: row.luggage.map((item) => ({ name: item.luggageType.name, quantity: item.quantity })),
      extras: row.extraServices.map((item) => ({
        name: item.extraService.name,
        quantity: item.quantity,
        returnQuantity: item.returnQuantity,
        unitPrice: item.unitPrice.toNumber(),
      })),
      notes: row.notes,
      returnNotes: row.returnNotes,
      pricing: row.pricing as BookingEmail["pricing"],
    };
  }

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
      await send({ booking: this.toBookingEmail(row), context: this.context(), prefs });
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
