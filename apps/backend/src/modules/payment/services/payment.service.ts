import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  type OnModuleDestroy,
  type OnModuleInit,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { BookingStatus, BookingType, PaymentMode } from "@prisma/client";
import type { Request } from "express";
import { AppLogger } from "../../../common/logger/app.logger";
import { allocateCode } from "../../../common/utils/allocate-sequence-code";
import { auditLog } from "../../../common/utils/audit-log";
import { toRequestContext } from "../../../common/utils/to-request-context";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { SequenceService } from "../../../infrastructure/sequence/sequence.service";
import { SquareService } from "../../../infrastructure/square/square.service";
import type { CheckoutDto } from "../../booking/dto/booking.dto";
import { BookingRepository } from "../../booking/repositories/booking.repository";
import { BookingEmailService } from "../../booking/services/booking-email.service";
import { NotificationService } from "../../booking/services/notification.service";
import { BookingSmsService } from "../../booking/services/booking-sms.service";
import { BookingPricingService } from "../../booking/services/booking-pricing.service";
import type { PassengerInput } from "../../booking/types/booking";
import { PlatformSettingsService } from "../../platform-settings/services/platform-settings.service";
import { PaymentRepository } from "../repositories/payment.repository";
import type { CheckoutBooking, SquareWebhookEvent } from "../types/payment";

const CHECKOUT_TTL_MS = 30 * 60 * 1000;
const SWEEP_INTERVAL_MS = 5 * 60 * 1000;

const TRIP_LABELS: Record<BookingType, string> = {
  ONE_WAY: "One-way transfer",
  RETURN: "Return transfer",
  HOURLY: "Hourly hire",
};

@Injectable()
export class PaymentService implements OnModuleInit, OnModuleDestroy {
  private sweepTimer: NodeJS.Timeout | null = null;

  constructor(
    @Inject(BookingPricingService) private readonly pricingService: BookingPricingService,
    @Inject(BookingRepository) private readonly bookingRepository: BookingRepository,
    @Inject(PaymentRepository) private readonly paymentRepository: PaymentRepository,
    @Inject(SequenceService) private readonly sequenceService: SequenceService,
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(NotificationService) private readonly notifications: NotificationService,
    @Inject(PlatformSettingsService)
    private readonly platformSettingsService: PlatformSettingsService,
    @Inject(SquareService) private readonly square: SquareService,
    @Inject(BookingEmailService) private readonly bookingEmails: BookingEmailService,
    @Inject(BookingSmsService) private readonly bookingSms: BookingSmsService,
    @Inject(ConfigService) private readonly configService: ConfigService,
    @Inject(AppLogger) private readonly logger: AppLogger,
  ) {}

  onModuleInit() {
    if (this.configService.get<string>("NODE_ENV") === "test") return;
    this.sweepTimer = setInterval(() => void this.releaseExpiredCheckouts(), SWEEP_INTERVAL_MS);
  }

  onModuleDestroy() {
    if (this.sweepTimer) clearInterval(this.sweepTimer);
  }

  async startCheckout(body: CheckoutDto, request: Request) {
    const { paymentMode } = await this.platformSettingsService.get();
    if (!this.square.isConfigured(paymentMode)) {
      throw new ServiceUnavailableException(
        "Online payment is not available right now. Please contact us to book.",
      );
    }

    const pricing = await this.pricingService.calculatePrice(body);
    const bookingType = body.bookingType ?? BookingType.ONE_WAY;
    const bookingNumber = await allocateCode({
      prefix: "BK",
      nextSequence: () => this.sequenceService.nextBooking(),
    });
    const booking = await this.bookingRepository.create({
      userId: await this.bookingRepository.findCustomerIdByEmail(body.passenger.email),
      vehicleCategoryId: body.vehicleCategoryId,
      bookingNumber,
      bookingType,
      vehicleCount: body.vehicleCount,
      status: BookingStatus.PENDING,
      pricing,
      address: {
        ...body.address,
        distance: body.address.distance ?? 0,
        travelDuration: body.address.travelDuration ?? 0,
      },
      passenger: body.passenger,
      bookingTime: body.bookingTime,
      flightDetails: body.flightDetails,
      meetAndGreet: body.meetAndGreet,
      extraServices: body.extraServices,
      notes: body.notes ?? null,
      returnNotes: body.returnNotes ?? null,
      notifyByEmail: body.notifications?.email,
      notifyBySms: body.notifications?.sms,
      luggage: body.luggage ?? [],
    });

    const websiteUrl = this.configService.getOrThrow<string>("WEBSITE_URL").replace(/\/+$/, "");

    try {
      const link = await this.square.createPaymentLink({
        mode: paymentMode,
        bookingNumber,
        amount: pricing.total,
        description: TRIP_LABELS[bookingType],
        customerEmail: body.passenger.email,
        redirectUrl: `${websiteUrl}/book-ride/payment-success`,
      });
      await this.bookingRepository.attachPaymentLink(booking.id, link, paymentMode);

      await auditLog({
        prisma: this.prisma,
        event: "booking.checkout_started",
        result: "success",
        context: toRequestContext(request),
        metadata: { bookingId: booking.id, bookingNumber, paymentMode },
      });

      return { url: link.url, orderId: link.orderId, bookingNumber };
    } catch (error) {
      await this.bookingRepository.delete(booking.id);
      throw error;
    }
  }

  async checkoutBooking(orderId: string) {
    const found = await this.bookingRepository.findByOrderId(orderId);
    if (!found) {
      throw new NotFoundException("Booking not found");
    }
    if (found.status === BookingStatus.PENDING) {
      await this.settle(orderId, false);
    }

    const booking = await this.bookingRepository.findById(found.id);
    if (!booking) {
      throw new NotFoundException("Booking not found");
    }
    return booking;
  }

  async handleWebhook(payload: Buffer | undefined, signature: string | undefined) {
    if (!payload || !signature) {
      throw new BadRequestException("Missing Square signature");
    }

    const body = payload.toString("utf8");
    await this.square.verifyWebhook(body, signature);
    const event = JSON.parse(body) as SquareWebhookEvent;
    const orderId = event.data?.object?.payment?.order_id;
    if (event.type?.startsWith("payment.") && orderId) {
      await this.settle(orderId, false);
    }
    return { received: true };
  }

  async releaseExpiredCheckouts() {
    const bookings = await this.bookingRepository.findUnpaidCheckouts(
      new Date(Date.now() - CHECKOUT_TTL_MS),
    );
    for (const booking of bookings) {
      if (!booking.squareOrderId) continue;
      try {
        await this.settle(booking.squareOrderId, true);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        this.logger.error(
          `Checkout release failed for order ${booking.squareOrderId}: ${message}`,
          undefined,
          PaymentService.name,
        );
      }
    }
  }

  private async settle(orderId: string, expired: boolean) {
    const booking = await this.bookingRepository.findByOrderId(orderId);
    if (!booking || booking.status !== BookingStatus.PENDING) return;

    const mode = booking.paymentMode ?? PaymentMode.TEST;
    const result = await this.square.retrieveOrder(mode, orderId);
    const checkoutBooking: CheckoutBooking = {
      id: booking.id,
      status: booking.status,
      bookingNumber: booking.bookingNumber,
      userId: booking.userId,
      passenger: booking.passenger as PassengerInput,
    };

    if (result.paid) {
      if (await this.paymentRepository.recordPaid(checkoutBooking, result, mode)) {
        await this.onPaid(checkoutBooking);
      }
    } else if (expired) {
      if (booking.squarePaymentLinkId) {
        await this.square
          .deletePaymentLink(mode, booking.squarePaymentLinkId)
          .catch(() => undefined);
      }
      await this.paymentRepository.recordCancelled(checkoutBooking, result, mode);
    }
  }

  private async onPaid(booking: CheckoutBooking) {
    await this.notifications.paid({
      bookingId: booking.id,
      bookingNumber: booking.bookingNumber,
      userId: booking.userId,
    });
    void this.bookingEmails.sendPaid(booking.id);
    void this.bookingSms.sendPaid(booking.id);
  }
}
