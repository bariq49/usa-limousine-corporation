import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PaymentStatus } from "@prisma/client";
import { AppLogger } from "../../../common/logger/app.logger";
import { toBookingEmail } from "../utils/booking-email-view";
import { renderReceiptPdf } from "../../../infrastructure/email/templates/booking/receipt-pdf";
import { BookingRepository } from "../repositories/booking.repository";

const LOGO_TIMEOUT_MS = 3000;

@Injectable()
export class ReceiptService {
  private logo: Promise<Buffer | null> | null = null;

  constructor(
    @Inject(BookingRepository) private readonly bookingRepository: BookingRepository,
    @Inject(ConfigService) private readonly configService: ConfigService,
    @Inject(AppLogger) private readonly logger: AppLogger,
  ) {}

  async forOrder(orderId: string): Promise<{ fileName: string; pdf: Buffer }> {
    const found = await this.bookingRepository.findByOrderId(orderId);
    const booking = found ? await this.bookingRepository.findById(found.id) : null;
    const payment = booking?.payment;
    if (
      !booking ||
      !payment ||
      (payment.status !== PaymentStatus.PAID && payment.status !== PaymentStatus.REFUNDED)
    ) {
      throw new NotFoundException("A receipt is available once the booking is paid");
    }

    const pdf = await renderReceiptPdf({
      booking: toBookingEmail(booking),
      payment: {
        status: payment.status,
        amount: payment.amount.toNumber(),
        cardBrand: payment.cardBrand,
        cardLast4: payment.cardLast4,
        transactionId: payment.transactionId,
        paidAt: payment.paidAt,
        refundedAmount: payment.refundedAmount?.toNumber() ?? null,
        refundedAt: payment.refundedAt,
      },
      issuedAt: new Date(),
      logo: await this.loadLogo(),
      siteUrl: this.configService.getOrThrow<string>("WEBSITE_URL"),
    });

    return { fileName: `receipt-${booking.bookingNumber}.pdf`, pdf };
  }

  private loadLogo(): Promise<Buffer | null> {
    if (!this.logo) {
      const cloud = this.configService.getOrThrow<string>("CLOUDINARY_CLOUD_NAME");
      this.logo = fetch(
        `https://res.cloudinary.com/${cloud}/image/upload/w_640/usa-limousine/email/white-logo.png`,
        { signal: AbortSignal.timeout(LOGO_TIMEOUT_MS) },
      )
        .then(async (response) => (response.ok ? Buffer.from(await response.arrayBuffer()) : null))
        .catch((error: unknown) => {
          const message = error instanceof Error ? error.message : "Unknown error";
          this.logger.error(
            `Receipt logo failed to load: ${message}`,
            undefined,
            ReceiptService.name,
          );
          this.logo = null;
          return null;
        });
    }
    return this.logo;
  }
}
