import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { BookingType } from "@prisma/client";
import { wallClock } from "../../../common/utils/day-bounds";
import { APP_TIMEZONE } from "../../../common/utils/format-time";
import { roundAmount } from "../../../common/utils/money";
import { isAirportTrip } from "../../../common/utils/places";
import { MapsService } from "../../../infrastructure/maps/maps.service";
import { PlatformSettingsService } from "../../platform-settings/services/platform-settings.service";
import type {
  BookingPricing,
  BookingPricingInput,
  LegPricing,
  LegQuote,
  PlatformRates,
  PricedLine,
} from "../../platform-settings/types/platform-settings";
import { PublicService as VehiclePricingService } from "../../vehicle-categories/services/public.service";
import type { CheckoutDto, CreateDto, TripPriceDto } from "../dto/booking.dto";
import { BookingRepository } from "../repositories/booking.repository";
import type { TripPricing } from "../types/booking";

function percentOf(amount: number, rate: number): number {
  return roundAmount((amount * rate) / 100);
}

@Injectable()
export class BookingPricingService {
  constructor(
    @Inject(BookingRepository) private readonly bookingRepository: BookingRepository,
    @Inject(PlatformSettingsService)
    private readonly platformSettingsService: PlatformSettingsService,
    @Inject(VehiclePricingService)
    private readonly vehiclePricingService: VehiclePricingService,
    @Inject(MapsService) private readonly maps: MapsService,
  ) {}

  quoteLeg(
    basePrice: number,
    discountRate: number,
    rates: PlatformRates,
    isAirport: boolean,
  ): LegQuote {
    const base = roundAmount(basePrice);
    const fuelSurchargeAmount = percentOf(base, rates.fuelSurchargeRate);
    const gratuityAmount = percentOf(base, rates.gratuityRate);
    const taxAmount = percentOf(base, rates.taxRate);
    const transactionFeeAmount = percentOf(base, rates.transactionFeeRate);
    const priceBeforeDiscount = roundAmount(
      base + fuelSurchargeAmount + gratuityAmount + taxAmount + transactionFeeAmount,
    );
    const discountAmount = percentOf(priceBeforeDiscount, discountRate);
    const airportFeeAmount = isAirport ? roundAmount(rates.airportPickupFee) : 0;

    return {
      basePrice: base,
      fuelSurchargeAmount,
      gratuityAmount,
      taxAmount,
      transactionFeeAmount,
      priceBeforeDiscount,
      discountRate,
      discountAmount,
      airportFeeAmount,
      total: roundAmount(priceBeforeDiscount - discountAmount + airportFeeAmount),
    };
  }

  bookingPricing(input: BookingPricingInput): BookingPricing {
    const { rates } = input;
    const oneWay = this.quoteLeg(input.basePrice, rates.oneWayDiscountRate, rates, input.isAirport);
    const back = this.quoteLeg(input.basePrice, rates.returnDiscountRate, rates, input.isAirport);
    const vehicles = Math.max(1, input.vehicleCount ?? 1);
    const legs = Array.from({ length: vehicles }).flatMap(() =>
      input.isReturn ? [oneWay, back] : [oneWay],
    );
    const legPricing = (leg: LegQuote, meetAndGreet: boolean): LegPricing => ({
      basePrice: roundAmount(leg.basePrice * vehicles),
      fuelSurchargePrice: roundAmount(leg.fuelSurchargeAmount * vehicles),
      gratuityPrice: roundAmount(leg.gratuityAmount * vehicles),
      taxPrice: roundAmount(leg.taxAmount * vehicles),
      transactionFeePrice: roundAmount(leg.transactionFeeAmount * vehicles),
      discountPrice: roundAmount(leg.discountAmount * vehicles),
      airportPickupPrice: roundAmount(leg.airportFeeAmount * vehicles),
      meetAndGreetPrice: meetAndGreet ? roundAmount(rates.meetAndGreetFee) : 0,
      total: roundAmount(leg.total * vehicles),
    });

    const sum = (pick: (leg: LegQuote) => number) =>
      roundAmount(legs.reduce((total, leg) => total + pick(leg), 0));

    const stopsPrice = roundAmount(rates.stopFee * input.stopsCount);
    const meetAndGreetPrice = roundAmount(
      rates.meetAndGreetFee *
        (Number(input.meetAndGreetOneWay) + Number(input.isReturn && input.meetAndGreetReturn)),
    );
    const extraServicesPrice = roundAmount(input.extraServicesPrice);
    const notificationsPrice = roundAmount(input.notificationsPrice ?? 0);
    const legsTotal = sum((leg) => leg.total);

    const pricing: BookingPricing = {
      basePrice: sum((leg) => leg.basePrice),
      fuelSurchargePrice: sum((leg) => leg.fuelSurchargeAmount),
      gratuityPrice: sum((leg) => leg.gratuityAmount),
      taxPrice: sum((leg) => leg.taxAmount),
      transactionFeePrice: sum((leg) => leg.transactionFeeAmount),
      discountPrice: sum((leg) => leg.discountAmount),
      airportPickupPrice: sum((leg) => leg.airportFeeAmount),
      stopsPrice,
      meetAndGreetPrice,
      extraServicesPrice,
      notificationsPrice,
      total: roundAmount(
        legsTotal + stopsPrice + meetAndGreetPrice + extraServicesPrice + notificationsPrice,
      ),
      rates: {
        fuelSurchargeRate: rates.fuelSurchargeRate,
        gratuityRate: rates.gratuityRate,
        taxRate: rates.taxRate,
        transactionFeeRate: rates.transactionFeeRate,
        oneWayDiscountRate: rates.oneWayDiscountRate,
        returnDiscountRate: rates.returnDiscountRate,
      },
    };
    if (input.items?.length) {
      pricing.items = input.items;
    }
    if (input.isReturn) {
      pricing.legs = {
        oneWay: legPricing(oneWay, input.meetAndGreetOneWay),
        returnTrip: legPricing(back, input.meetAndGreetReturn),
      };
    }
    return pricing;
  }

  async applyServerRoute(body: TripPriceDto): Promise<void> {
    const bookingType = body.bookingType ?? BookingType.ONE_WAY;
    const isHourly = bookingType === BookingType.HOURLY;
    const dropoff = body.address.dropoff;
    const stops = (body.address.stops ?? []).filter((stop) => stop.address?.trim());

    if (isHourly) {
      if (!body.hourlyDuration) {
        throw new BadRequestException("Hourly duration is required for hourly bookings");
      }
      const durations = await this.vehiclePricingService.findHourlyDurations();
      if (!durations.includes(body.hourlyDuration)) {
        throw new BadRequestException("Selected hourly duration is not available");
      }
      body.address.hourlyDuration = body.hourlyDuration;
    } else {
      delete body.address.hourlyDuration;
    }

    if (!isHourly && !dropoff?.address?.trim()) {
      throw new BadRequestException("A drop-off location is required");
    }

    if (dropoff?.address?.trim()) {
      const route = await this.maps.resolveRoute({
        pickup: body.address.pickup,
        dropoff,
        stops,
      });
      body.address.distance = route.distance;
      body.address.travelDuration = route.travelDuration;
      return;
    }

    const lastStop = stops.at(-1);
    if (isHourly && lastStop) {
      const route = await this.maps.resolveRoute({
        pickup: body.address.pickup,
        dropoff: lastStop,
        stops: stops.slice(0, -1),
      });
      body.address.distance = route.distance;
      body.address.travelDuration = route.travelDuration;
      return;
    }

    body.address.distance = 0;
    body.address.travelDuration = 0;
  }

  async tripPricing(body: TripPriceDto, checkNotice = true): Promise<TripPricing> {
    const bookingType = body.bookingType ?? BookingType.ONE_WAY;
    const isHourly = bookingType === BookingType.HOURLY;
    if (
      bookingType !== BookingType.ONE_WAY &&
      bookingType !== BookingType.RETURN &&
      bookingType !== BookingType.HOURLY
    ) {
      throw new BadRequestException("Unsupported booking type");
    }

    await this.applyServerRoute(body);

    const rates = await this.platformSettingsService.get();
    const pickupAt = wallClock(
      APP_TIMEZONE,
      body.bookingTime.pickupDate,
      body.bookingTime.pickupTime,
    );
    if (!pickupAt) {
      throw new BadRequestException("Pickup date or time is invalid");
    }
    if (checkNotice && pickupAt.getTime() <= Date.now()) {
      throw new BadRequestException({
        message: "The pickup time has already passed. Please choose a later time.",
        error: "PICKUP_PASSED",
      });
    }
    if (checkNotice && pickupAt.getTime() < Date.now() + rates.minBookingMinutes * 60_000) {
      throw new BadRequestException({
        message: `Bookings need at least ${rates.minBookingNotice} ${rates.minBookingNoticeUnit === "HOUR" ? "hour(s)" : "minute(s)"} notice. Please choose a later time.`,
        error: "PICKUP_TOO_SOON",
      });
    }

    const isReturn = bookingType === BookingType.RETURN;
    if (isReturn) {
      const { returnDate, returnTime } = body.bookingTime;
      const returnAt =
        returnDate && returnTime ? wallClock(APP_TIMEZONE, returnDate, returnTime) : null;
      if (!returnAt) {
        throw new BadRequestException("Return date and time are required for a return trip");
      }
      if (returnAt.getTime() <= pickupAt.getTime()) {
        throw new BadRequestException("The return must be after the pickup");
      }
    }

    const items = await this.bookingRepository.priceItems(
      body.extraServices ?? [],
      body.luggage ?? [],
    );
    const lines: PricedLine[] = items.extraServices
      .map((item): PricedLine => {
        const returnQuantity = isReturn ? item.returnQuantity : 0;
        const unitPrice = item.unitPrice.toNumber();
        return {
          type: "EXTRA_SERVICE",
          id: item.extraServiceId,
          name: item.name,
          quantity: item.quantity,
          returnQuantity,
          unitPrice,
          total: roundAmount(unitPrice * (item.quantity + returnQuantity)),
        };
      })
      .concat(
        items.luggage.map((item): PricedLine => {
          const unitPrice = item.unitPrice.toNumber();
          return {
            type: "LUGGAGE",
            id: item.luggageTypeId,
            name: item.name,
            quantity: item.quantity,
            returnQuantity: 0,
            unitPrice,
            total: roundAmount(unitPrice * item.quantity),
          };
        }),
      )
      .filter((line) => line.total > 0);
    const extraServicesPrice = lines.reduce((total, line) => total + line.total, 0);
    const dropoffAddress = body.address.dropoff?.address ?? "";

    return {
      rates,
      isAirport: !isHourly && isAirportTrip(body.address.pickup.address, dropoffAddress),
      isReturn,
      stopsCount: (body.address.stops ?? []).length,
      meetAndGreetOneWay: Boolean(body.meetAndGreet?.enabled),
      meetAndGreetReturn: isReturn && Boolean(body.meetAndGreet?.returnEnabled),
      extraServicesPrice: roundAmount(extraServicesPrice),
      notificationsPrice: roundAmount(
        (body.notifications?.email ? rates.emailNotificationFee : 0) +
          (body.notifications?.sms ? rates.smsNotificationFee : 0),
      ),
      items: lines,
    };
  }

  async priceForCustomer(body: CreateDto | CheckoutDto): Promise<BookingPricing> {
    const vehicleCount = body.vehicleCount ?? 1;
    const capacity = await this.bookingRepository.vehicleCapacity(body.vehicleCategoryId);
    if (!capacity) {
      throw new BadRequestException("This vehicle is not available");
    }
    if (body.passenger.passengerCount > capacity.passengers * vehicleCount) {
      throw new BadRequestException(
        `Up to ${capacity.passengers * vehicleCount} passengers fit in the selected vehicles`,
      );
    }
    const luggageCount = (body.luggage ?? []).reduce((total, item) => total + item.quantity, 0);
    if (luggageCount > capacity.luggage * vehicleCount) {
      throw new BadRequestException(
        `Up to ${capacity.luggage * vehicleCount} bags fit in the selected vehicles`,
      );
    }

    const trip = await this.tripPricing(body);
    const isHourly = (body.bookingType ?? BookingType.ONE_WAY) === BookingType.HOURLY;
    const basePrice = isHourly
      ? await this.vehiclePricingService.basePriceForHours(
          body.vehicleCategoryId,
          body.hourlyDuration as number,
          body.address.distance,
        )
      : await this.vehiclePricingService.basePriceFor(
          body.vehicleCategoryId,
          body.address.distance,
        );
    if (basePrice === null) {
      throw new BadRequestException(
        isHourly
          ? "This vehicle is not available for hourly hire"
          : "This vehicle is not available for the trip distance",
      );
    }

    return this.bookingPricing(Object.assign({ basePrice, vehicleCount }, trip));
  }
}
