import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { BookingStatus, BookingType, NotificationType, PaymentMode } from "@prisma/client";
import type { Request } from "express";
import { AppLogger } from "../../../common/logger/app.logger";
import { allocateCode } from "../../../common/utils/allocate-sequence-code";
import { auditLog } from "../../../common/utils/audit-log";
import { toRequestContext } from "../../../common/utils/to-request-context";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { SequenceService } from "../../../infrastructure/sequence/sequence.service";
import { StripeService } from "../../../infrastructure/stripe/stripe.service";
import { TwilioService } from "../../../infrastructure/twilio/twilio.service";
import type { CreateDto } from "../../booking/dto/booking.dto";
import { formatDate, formatTime } from "../../booking/emails/cards";
import { BookingRepository } from "../../booking/repositories/booking.repository";
import { BookingEmailService } from "../../booking/services/booking-email.service";
import { BookingService } from "../../booking/services/booking.service";
import type { PassengerInput, TimeInput } from "../../booking/types/booking";
import { NotificationService } from "../../notification/services/notification.service";
import { PlatformSettingsService } from "../../platform-settings/services/platform-settings.service";
import { PaymentRepository } from "../repositories/payment.repository";
import type { CheckoutBooking } from "../types/payment";

const DEFAULT_WEBSITE_URL = "https://www.usalimocorp.com";

const TRIP_LABELS: Record<BookingType, string> = {
  ONE_WAY: "One-way transfer",
  RETURN: "Return transfer",
  HOURLY: "Hourly hire",
};

const SETTLING_EVENTS = new Set([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "checkout.session.expired",
  "checkout.session.async_payment_failed",
]);

@Injectable()
export class PaymentService {
  constructor(
    @Inject(BookingService) private readonly bookingService: BookingService,
    @Inject(BookingRepository) private readonly bookingRepository: BookingRepository,
    @Inject(PaymentRepository) private readonly paymentRepository: PaymentRepository,
    @Inject(SequenceService) private readonly sequenceService: SequenceService,
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(NotificationService) private readonly notificationService: NotificationService,
    @Inject(PlatformSettingsService)
    private readonly platformSettingsService: PlatformSettingsService,
    @Inject(StripeService) private readonly stripe: StripeService,
    @Inject(BookingEmailService) private readonly bookingEmails: BookingEmailService,
    @Inject(TwilioService) private readonly twilio: TwilioService,
    @Inject(ConfigService) private readonly configService: ConfigService,
    @Inject(AppLogger) private readonly logger: AppLogger,
  ) {}

  async startCheckout(body: CreateDto, request: Request) {
    const { paymentMode } = await this.platformSettingsService.get();
    if (!this.stripe.isConfigured(paymentMode)) {
      throw new ServiceUnavailableException(
        "Online payment is not available right now. Please contact us to book.",
      );
    }

    const pricing = await this.bookingService.priceForCustomer(body);
    const bookingType = body.bookingType ?? BookingType.ONE_WAY;
    const bookingNumber = await allocateCode({
      prefix: "BK",
      nextSequence: () => this.sequenceService.nextBooking(),
    });
    const booking = await this.bookingRepository.create({
      userId: null,
      vehicleCategoryId: body.vehicleCategoryId,
      bookingNumber,
      bookingType,
      vehicleCount: body.vehicleCount,
      status: BookingStatus.PENDING,
      pricing,
      address: body.address,
      passenger: body.passenger,
      bookingTime: body.bookingTime,
      flightDetails: body.flightDetails,
      meetAndGreet: body.meetAndGreet,
      extraServices: body.extraServices,
      notes: body.notes ?? null,
      luggage: body.luggage ?? [],
    });

    const websiteUrl = (
      this.configService.get<string>("WEBSITE_URL") ?? DEFAULT_WEBSITE_URL
    ).replace(/\/+$/, "");

    try {
      const session = await this.stripe.createCheckoutSession({
        mode: paymentMode,
        bookingId: booking.id,
        bookingNumber,
        amount: pricing.total,
        description: TRIP_LABELS[bookingType],
        customerEmail: body.passenger.email,
        successUrl: `${websiteUrl}/book-ride/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${websiteUrl}/book-ride/payment-cancel`,
      });
      await this.bookingRepository.attachCheckoutSession(booking.id, session.id);

      await auditLog({
        prisma: this.prisma,
        event: "booking.checkout_started",
        result: "success",
        context: toRequestContext(request),
        metadata: { bookingId: booking.id, bookingNumber, paymentMode },
      });

      return { url: session.url, sessionId: session.id, bookingNumber };
    } catch (error) {
      await this.bookingRepository.delete(booking.id);
      throw error;
    }
  }

  async checkoutBooking(sessionId: string) {
    const found = await this.bookingRepository.findByCheckoutSession(sessionId);
    if (!found) {
      throw new NotFoundException("Booking not found");
    }
    if (found.status === BookingStatus.PENDING) {
      await this.settle(sessionId, false);
    }

    const booking = await this.bookingRepository.findById(found.id);
    if (!booking) {
      throw new NotFoundException("Booking not found");
    }
    return booking;
  }

  async handleWebhook(payload: Buffer | undefined, signature: string | undefined) {
    if (!payload || !signature) {
      throw new BadRequestException("Missing Stripe signature");
    }

    const { event } = this.stripe.constructEvent(payload, signature);
    if (SETTLING_EVENTS.has(event.type)) {
      const session = event.data.object as { id: string };
      await this.settle(session.id, event.type === "checkout.session.async_payment_failed");
    }
    return { received: true };
  }

  private async settle(sessionId: string, failed: boolean) {
    const booking = await this.bookingRepository.findByCheckoutSession(sessionId);
    if (!booking || booking.status !== BookingStatus.PENDING) return;

    const mode = sessionId.startsWith("cs_live_") ? PaymentMode.LIVE : PaymentMode.TEST;
    const result = await this.stripe.retrieveCheckout(mode, sessionId);
    const checkoutBooking: CheckoutBooking = {
      id: booking.id,
      status: booking.status,
      bookingNumber: booking.bookingNumber,
      passenger: booking.passenger as PassengerInput,
    };

    if (result.paid) {
      if (await this.paymentRepository.recordPaid(checkoutBooking, result, mode)) {
        await this.onPaid(checkoutBooking);
      }
    } else if (result.expired || failed) {
      await this.paymentRepository.recordCancelled(checkoutBooking, result, mode);
    }
  }

  private async onPaid(booking: CheckoutBooking) {
    const notifications = await this.prisma.$transaction((tx) =>
      this.notificationService.stageForAdmins(
        {
          type: NotificationType.BOOKING_CREATED,
          title: "New paid booking",
          body: `Booking ${booking.bookingNumber} was paid online.`,
          data: {
            type: "BOOKING_CREATED",
            bookingId: booking.id,
            bookingNumber: booking.bookingNumber,
          },
          idempotencyKey: `BOOKING_CREATED:${booking.id}`,
        },
        tx,
      ),
    );
    await this.notificationService.deliverStaged(notifications);
    void this.bookingEmails.sendPaid(booking.id);
    void this.sendPaidSms(booking);
  }

  private async sendPaidSms(booking: CheckoutBooking) {
    if (!this.twilio.isConfigured() || !booking.passenger.phone) return;

    try {
      const row = await this.bookingRepository.findById(booking.id);
      if (!row) return;
      const time = row.bookingTime as TimeInput;
      await this.twilio.send({
        to: booking.passenger.phone,
        body:
          `USA Limousine Corporation: your booking ${booking.bookingNumber} is confirmed and paid ` +
          `($${row.totalPrice.toFixed(2)}). Pickup ${formatDate(time.pickupDate)} at ${formatTime(time.pickupTime)}. ` +
          `Details are in your email. Questions? Call +1 732-289-8928.`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      this.logger.error(
        `Booking paid SMS failed for ${booking.id}: ${message}`,
        undefined,
        PaymentService.name,
      );
    }
  }
}
