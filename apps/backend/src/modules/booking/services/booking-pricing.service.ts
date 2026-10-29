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
  LegPricing,
  PlatformRates,
  PricedLine,
} from "../../platform-settings/types/platform-settings";
import { PublicService as VehiclePricingService } from "../../vehicle-categories/services/public.service";
import type { CheckoutDto, CreateDto, TripPriceDto } from "../dto/booking.dto";
import { BookingRepository } from "../repositories/booking.repository";
import type { VehicleEstimate } from "../types/booking";

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

  async calculateDistance(body: TripPriceDto): Promise<void> {
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
      const route = await this.maps.calculateDistance({
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
      const route = await this.maps.calculateDistance({
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

  async estimate(body: TripPriceDto, checkNotice = false): Promise<VehicleEstimate[]> {
    const bookingType = body.bookingType ?? BookingType.ONE_WAY;
    const isHourly = bookingType === BookingType.HOURLY;
    if (
      bookingType !== BookingType.ONE_WAY &&
      bookingType !== BookingType.RETURN &&
      bookingType !== BookingType.HOURLY
    ) {
      throw new BadRequestException("Unsupported booking type");
    }

    await this.calculateDistance(body);

    const rates = await this.platformSettingsService.get();
    const bookingTime = body.bookingTime;
    if (bookingTime) {
      const pickupAt = wallClock(APP_TIMEZONE, bookingTime.pickupDate, bookingTime.pickupTime);
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

      if (bookingType === BookingType.RETURN) {
        const { returnDate, returnTime } = bookingTime;
        const returnAt =
          returnDate && returnTime ? wallClock(APP_TIMEZONE, returnDate, returnTime) : null;
        if (!returnAt) {
          throw new BadRequestException("Return date and time are required for a return trip");
        }
        if (returnAt.getTime() <= pickupAt.getTime()) {
          throw new BadRequestException("The return must be after the pickup");
        }
      }
    }

    const isReturn = bookingType === BookingType.RETURN;
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

    const extraServicesPrice = roundAmount(lines.reduce((total, line) => total + line.total, 0));
    const notificationsPrice = roundAmount(
      (body.notifications?.email ? rates.emailNotificationFee : 0) +
        (body.notifications?.sms ? rates.smsNotificationFee : 0),
    );
    const dropoffAddress = body.address.dropoff?.address ?? "";
    const isAirport = !isHourly && isAirportTrip(body.address.pickup.address, dropoffAddress);
    const meetAndGreetOneWay = Boolean(body.meetAndGreet?.enabled);
    const meetAndGreetReturn = isReturn && Boolean(body.meetAndGreet?.returnEnabled);
    const stopsCount = (body.address.stops ?? []).length;
    const vehicleCount = body.vehicleCount ?? 1;
    const distance = body.address.distance ?? 0;
    const travelDuration = body.address.travelDuration ?? 0;
    const vehicles = isHourly
      ? await this.vehiclePricingService.pricedForHours(body.hourlyDuration as number, distance)
      : await this.vehiclePricingService.pricedForDistance(distance);

    return vehicles.map((vehicle) => {
      const pricing = this.totals({
        basePrice: vehicle.basePrice,
        vehicleCount,
        rates,
        isAirport,
        isReturn,
        stopsCount,
        meetAndGreetOneWay,
        meetAndGreetReturn,
        extraServicesPrice,
        notificationsPrice,
        items: lines,
      });
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
        distance,
        travelDuration,
      };
    });
  }

  async calculatePrice(body: CreateDto | CheckoutDto): Promise<BookingPricing> {
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

    const options = await this.estimate(body, true);
    const match = options.find((option) => option.vehicleCategory.id === body.vehicleCategoryId);
    if (!match) {
      const isHourly = (body.bookingType ?? BookingType.ONE_WAY) === BookingType.HOURLY;
      throw new BadRequestException(
        isHourly
          ? "This vehicle is not available for hourly hire"
          : "This vehicle is not available for the trip distance",
      );
    }
    return match.pricing;
  }

  private totals(input: {
    basePrice: number;
    vehicleCount: number;
    rates: PlatformRates;
    isAirport: boolean;
    isReturn: boolean;
    stopsCount: number;
    meetAndGreetOneWay: boolean;
    meetAndGreetReturn: boolean;
    extraServicesPrice: number;
    notificationsPrice: number;
    items: PricedLine[];
  }): BookingPricing {
    const { rates } = input;
    const vehicles = Math.max(1, input.vehicleCount);
    const base = roundAmount(input.basePrice);
    const fuel = percentOf(base, rates.fuelSurchargeRate);
    const gratuity = percentOf(base, rates.gratuityRate);
    const tax = percentOf(base, rates.taxRate);
    const transactionFee = percentOf(base, rates.transactionFeeRate);
    const beforeDiscount = roundAmount(base + fuel + gratuity + tax + transactionFee);
    const airport = input.isAirport ? roundAmount(rates.airportPickupFee) : 0;
    const oneWayDiscount = percentOf(beforeDiscount, rates.oneWayDiscountRate);
    const oneWay: LegPricing = {
      basePrice: roundAmount(base * vehicles),
      fuelSurchargePrice: roundAmount(fuel * vehicles),
      gratuityPrice: roundAmount(gratuity * vehicles),
      taxPrice: roundAmount(tax * vehicles),
      transactionFeePrice: roundAmount(transactionFee * vehicles),
      discountPrice: roundAmount(oneWayDiscount * vehicles),
      airportPickupPrice: roundAmount(airport * vehicles),
      meetAndGreetPrice: input.meetAndGreetOneWay ? roundAmount(rates.meetAndGreetFee) : 0,
      total: roundAmount((beforeDiscount - oneWayDiscount + airport) * vehicles),
    };

    let returnTrip: LegPricing | null = null;
    if (input.isReturn) {
      const returnDiscount = percentOf(beforeDiscount, rates.returnDiscountRate);
      returnTrip = {
        basePrice: roundAmount(base * vehicles),
        fuelSurchargePrice: roundAmount(fuel * vehicles),
        gratuityPrice: roundAmount(gratuity * vehicles),
        taxPrice: roundAmount(tax * vehicles),
        transactionFeePrice: roundAmount(transactionFee * vehicles),
        discountPrice: roundAmount(returnDiscount * vehicles),
        airportPickupPrice: roundAmount(airport * vehicles),
        meetAndGreetPrice: input.meetAndGreetReturn ? roundAmount(rates.meetAndGreetFee) : 0,
        total: roundAmount((beforeDiscount - returnDiscount + airport) * vehicles),
      };
    }

    const stopsPrice = roundAmount(rates.stopFee * input.stopsCount);
    const meetAndGreetPrice = roundAmount(
      rates.meetAndGreetFee *
        (Number(input.meetAndGreetOneWay) + Number(input.isReturn && input.meetAndGreetReturn)),
    );
    const legsTotal = roundAmount(oneWay.total + (returnTrip?.total ?? 0));

    const pricing: BookingPricing = {
      basePrice: roundAmount(oneWay.basePrice + (returnTrip?.basePrice ?? 0)),
      fuelSurchargePrice: roundAmount(
        oneWay.fuelSurchargePrice + (returnTrip?.fuelSurchargePrice ?? 0),
      ),
      gratuityPrice: roundAmount(oneWay.gratuityPrice + (returnTrip?.gratuityPrice ?? 0)),
      taxPrice: roundAmount(oneWay.taxPrice + (returnTrip?.taxPrice ?? 0)),
      transactionFeePrice: roundAmount(
        oneWay.transactionFeePrice + (returnTrip?.transactionFeePrice ?? 0),
      ),
      discountPrice: roundAmount(oneWay.discountPrice + (returnTrip?.discountPrice ?? 0)),
      airportPickupPrice: roundAmount(
        oneWay.airportPickupPrice + (returnTrip?.airportPickupPrice ?? 0),
      ),
      stopsPrice,
      meetAndGreetPrice,
      extraServicesPrice: roundAmount(input.extraServicesPrice),
      notificationsPrice: roundAmount(input.notificationsPrice),
      total: roundAmount(
        legsTotal +
          stopsPrice +
          meetAndGreetPrice +
          input.extraServicesPrice +
          input.notificationsPrice,
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

    if (input.items.length) {
      pricing.items = input.items;
    }
    if (returnTrip) {
      pricing.legs = { oneWay, returnTrip };
    }

    return pricing;
  }
}
