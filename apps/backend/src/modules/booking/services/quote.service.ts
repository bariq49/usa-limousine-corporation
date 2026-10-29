import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  type OnModuleDestroy,
  type OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { BookingType, type Prisma, type Quote } from "@prisma/client";
import { AppLogger } from "../../../common/logger/app.logger";
import type { BookingPricing } from "../../platform-settings/types/platform-settings";
import { PublicService as VehiclePricingService } from "../../vehicle-categories/services/public.service";
import type { CheckoutDto, QuoteDto, TripPriceDto } from "../dto/booking.dto";
import { QuoteRepository } from "../repositories/quote.repository";
import type { QuoteEstimate, SavedQuote } from "../types/booking";
import type { StoredQuoteInput } from "../types/quote";
import { quoteHash, quoteInput } from "../utils/quote-input";
import { routeDrifted } from "../utils/route-drift";
import { BookingPricingService } from "./booking-pricing.service";

const QUOTE_TTL_MS = 15 * 60 * 1000;
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000;
const CLEANUP_AFTER_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class QuoteService implements OnModuleInit, OnModuleDestroy {
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(
    @Inject(BookingPricingService) private readonly pricingService: BookingPricingService,
    @Inject(QuoteRepository) private readonly quoteRepository: QuoteRepository,
    @Inject(VehiclePricingService)
    private readonly vehiclePricingService: VehiclePricingService,
    @Inject(ConfigService) private readonly configService: ConfigService,
    @Inject(AppLogger) private readonly logger: AppLogger,
  ) {}

  onModuleInit() {
    if (this.configService.get<string>("NODE_ENV") === "test") return;
    this.cleanupTimer = setInterval(() => void this.removeUnused(), CLEANUP_INTERVAL_MS);
  }

  onModuleDestroy() {
    if (this.cleanupTimer) clearInterval(this.cleanupTimer);
  }

  async estimate(body: TripPriceDto, checkNotice = false): Promise<QuoteEstimate[]> {
    const trip = await this.pricingService.tripPricing(body, checkNotice);
    const vehicleCount = body.vehicleCount ?? 1;
    const isHourly = (body.bookingType ?? BookingType.ONE_WAY) === BookingType.HOURLY;
    const vehicles = isHourly
      ? await this.vehiclePricingService.pricedForHours(
          body.hourlyDuration as number,
          body.address.distance,
        )
      : await this.vehiclePricingService.pricedForDistance(body.address.distance);

    return vehicles.map((vehicle) => {
      const pricing = this.pricingService.bookingPricing(
        Object.assign({ basePrice: vehicle.basePrice, vehicleCount }, trip),
      );
      return {
        vehicleCategory: {
          id: vehicle.id,
          name: vehicle.name,
          description: vehicle.description,
          image: vehicle.image,
          passengerCount: vehicle.passengerCount,
          luggageCount: vehicle.luggageCount,
        },
        vehicleCount,
        pricing,
        total: pricing.total,
      };
    });
  }

  async create(body: QuoteDto): Promise<SavedQuote> {
    const isHourly = (body.bookingType ?? BookingType.ONE_WAY) === BookingType.HOURLY;
    const estimate = (await this.estimate(body, true)).find(
      (option) => option.vehicleCategory.id === body.vehicleCategoryId,
    );
    if (!estimate) {
      throw new BadRequestException(
        isHourly
          ? "This vehicle is not available for hourly hire"
          : "This vehicle is not available for the trip distance",
      );
    }

    const input = quoteInput(body);
    const saved = await this.quoteRepository.create({
      vehicleCategoryId: body.vehicleCategoryId,
      inputHash: quoteHash(input),
      input,
      pricing: estimate.pricing as unknown as Prisma.InputJsonValue,
      total: estimate.total,
      expiresAt: new Date(Date.now() + QUOTE_TTL_MS),
    });

    return Object.assign({ id: saved.id, expiresAt: saved.expiresAt }, estimate);
  }

  async find(body: CheckoutDto): Promise<Quote> {
    const quote = await this.quoteRepository.findById(body.quoteId);
    if (!quote || quote.vehicleCategoryId !== body.vehicleCategoryId) {
      throw new ConflictException({
        message: "Your price is no longer available. Please review your trip.",
        error: "QUOTE_INVALID",
      });
    }
    return quote;
  }

  async pricingFor(quote: Quote, body: CheckoutDto): Promise<BookingPricing> {
    const stored = quote.input as unknown as StoredQuoteInput;
    const isHourly = (body.bookingType ?? BookingType.ONE_WAY) === BookingType.HOURLY;

    const current = await this.pricingService.priceForCustomer(body);

    if (!isHourly && routeDrifted(Number(stored.distance), body.address.distance)) {
      throw new ConflictException({
        message: "The price for your trip has changed. Please review the new price.",
        error: "PRICE_CHANGED",
        details: { quote: await this.create(body) },
      });
    }

    body.address.distance = Number(stored.distance);
    if (stored.travelDuration != null) {
      body.address.travelDuration = Number(stored.travelDuration);
    }
    if (isHourly && stored.hourlyDuration != null) {
      body.hourlyDuration = Number(stored.hourlyDuration);
      body.address.hourlyDuration = Number(stored.hourlyDuration);
    }

    const matches = quote.inputHash === quoteHash(quoteInput(body));
    const isValid = quote.expiresAt.getTime() > Date.now();

    if (matches && isValid) {
      return quote.pricing as unknown as BookingPricing;
    }
    if (matches && current.total === quote.total.toNumber()) {
      return current;
    }

    throw new ConflictException({
      message: matches
        ? "The price for your trip has changed. Please review the new price."
        : "Your trip changed since it was priced. Please review the new price.",
      error: "PRICE_CHANGED",
      details: { quote: await this.create(body) },
    });
  }

  async removeUnused() {
    try {
      await this.quoteRepository.deleteUnused(new Date(Date.now() - CLEANUP_AFTER_MS));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      this.logger.error(`Quote cleanup failed: ${message}`, undefined, QuoteService.name);
    }
  }
}
