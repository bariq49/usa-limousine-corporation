import { Inject, Injectable } from "@nestjs/common";
import { PricingType } from "@prisma/client";
import { roundAmount } from "../../../common/utils/money";
import type { LuggageQueryDto } from "../dto/luggage-query.dto";
import type { VehicleCategoryQueryDto } from "../dto/query.dto";
import { CategoriesRepository } from "../repositories/categories.repository";
import { HourlyPricingRepository } from "../repositories/hourly-pricing.repository";
import { LuggageRepository } from "../repositories/luggage.repository";
import { PricingRepository } from "../repositories/pricing.repository";
import { hourlyPrice, type PricedVehicle } from "../types/pricing";

@Injectable()
export class PublicService {
  constructor(
    @Inject(CategoriesRepository)
    private readonly categoriesRepository: CategoriesRepository,
    @Inject(LuggageRepository)
    private readonly luggageRepository: LuggageRepository,
    @Inject(PricingRepository)
    private readonly pricingRepository: PricingRepository,
    @Inject(HourlyPricingRepository)
    private readonly hourlyPricingRepository: HourlyPricingRepository,
  ) {}

  async findCategories(query: VehicleCategoryQueryDto) {
    const page = await this.categoriesRepository.findPublicCatalog(query);
    page.data.forEach((category) =>
      Object.assign(category, {
        luggageCount: category.luggageCapacity.reduce((total, item) => total + item.quantity, 0),
      }),
    );
    return page;
  }

  async findLuggage(query: LuggageQueryDto) {
    return this.luggageRepository.findPublicMany(query);
  }

  async findHourlyDurations() {
    const categories = await this.categoriesRepository.findPublicActive();
    const rows = await this.hourlyPricingRepository.findActiveDurations(
      categories.map((category) => category.id),
    );
    return rows.map((row) => row.durationHours);
  }

  async pricedForDistance(distance: number): Promise<PricedVehicle[]> {
    const categories = await this.categoriesRepository.findPublicActive();
    const pricings = await this.pricingRepository.findAllForDistance(
      distance,
      categories.map((category) => category.id),
    );
    const bestByCategory = new Map<string, (typeof pricings)[number]>();
    for (const row of pricings) {
      if (!bestByCategory.has(row.vehicleCategoryId)) {
        bestByCategory.set(row.vehicleCategoryId, row);
      }
    }

    return categories
      .filter((category) => bestByCategory.has(category.id))
      .map((category) => {
        const pricing = bestByCategory.get(category.id)!;
        const basePrice = pricing.basePrice.toNumber();
        const perUnitRate = pricing.perUnitRate?.toNumber() ?? 0;
        const percentageRate = pricing.percentageRate?.toNumber() ?? 0;
        let amount = basePrice;
        if (pricing.pricingType === PricingType.PER_UNIT) {
          amount = basePrice + distance * perUnitRate;
        } else if (pricing.pricingType === PricingType.PERCENTAGE) {
          amount = basePrice * (1 + percentageRate / 100);
        }
        return {
          id: category.id,
          name: category.name,
          description: category.description,
          image: category.image,
          passengerCount: category.passengerCount,
          luggageCount: category.luggageCapacity.reduce((total, item) => total + item.quantity, 0),
          basePrice: roundAmount(amount),
        };
      });
  }

  async pricedForHours(hours: number, distance = 0): Promise<PricedVehicle[]> {
    const categories = await this.categoriesRepository.findPublicActive();
    const rows = await this.hourlyPricingRepository.findActiveByDuration(
      hours,
      categories.map((category) => category.id),
    );
    const pricingByCategory = new Map(rows.map((row) => [row.vehicleCategoryId, row]));

    return categories
      .filter((category) => pricingByCategory.has(category.id))
      .map((category) => {
        const pricing = pricingByCategory.get(category.id)!;
        return {
          id: category.id,
          name: category.name,
          description: category.description,
          image: category.image,
          passengerCount: category.passengerCount,
          luggageCount: category.luggageCapacity.reduce((total, item) => total + item.quantity, 0),
          basePrice: hourlyPrice(
            {
              basePrice: pricing.basePrice.toNumber(),
              includedDistance: pricing.includedDistance,
              extraDistanceRate: pricing.extraDistanceRate,
            },
            distance,
          ),
        };
      });
  }

  async basePriceFor(vehicleCategoryId: string, distance: number): Promise<number | null> {
    const categories = await this.categoriesRepository.findPublicActive();
    if (!categories.some((category) => category.id === vehicleCategoryId)) {
      return null;
    }
    const [pricing] = await this.pricingRepository.findAllForDistance(distance, [
      vehicleCategoryId,
    ]);
    if (!pricing) {
      return null;
    }
    const basePrice = pricing.basePrice.toNumber();
    const perUnitRate = pricing.perUnitRate?.toNumber() ?? 0;
    const percentageRate = pricing.percentageRate?.toNumber() ?? 0;
    if (pricing.pricingType === PricingType.PER_UNIT) {
      return roundAmount(basePrice + distance * perUnitRate);
    }
    if (pricing.pricingType === PricingType.PERCENTAGE) {
      return roundAmount(basePrice * (1 + percentageRate / 100));
    }
    return roundAmount(basePrice);
  }

  async basePriceForHours(
    vehicleCategoryId: string,
    hours: number,
    distance = 0,
  ): Promise<number | null> {
    const categories = await this.categoriesRepository.findPublicActive();
    if (!categories.some((category) => category.id === vehicleCategoryId)) {
      return null;
    }
    const [pricing] = await this.hourlyPricingRepository.findActiveByDuration(hours, [
      vehicleCategoryId,
    ]);
    if (!pricing) {
      return null;
    }
    return hourlyPrice(
      {
        basePrice: pricing.basePrice.toNumber(),
        includedDistance: pricing.includedDistance,
        extraDistanceRate: pricing.extraDistanceRate,
      },
      distance,
    );
  }
}
