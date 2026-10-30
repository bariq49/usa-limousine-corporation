import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { PricingType } from "@prisma/client";
import { roundAmount } from "../../../common/utils/money";
import type { VehicleCategoryQueryDto } from "../dto/query.dto";
import { CategoriesRepository } from "../repositories/categories.repository";
import { HourlyPricingRepository } from "../repositories/hourly-pricing.repository";
import { PricingRepository } from "../repositories/pricing.repository";
import type { PricedVehicle } from "../types/pricing";

@Injectable()
export class PublicService {
  constructor(
    @Inject(CategoriesRepository)
    private readonly categoriesRepository: CategoriesRepository,
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

  async findAllCategories() {
    const categories = await this.categoriesRepository.findPublicActive();
    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      models: category.models,
      description: category.description,
      image: category.image,
      passengerCount: category.passengerCount,
      luggageCount: category.luggageCapacity.reduce((total, item) => total + item.quantity, 0),
    }));
  }

  async findCategoryLuggage(categoryId: string) {
    const category = await this.categoriesRepository.findById(categoryId);
    if (!category || category.deletedAt || !category.isActive) {
      throw new NotFoundException("Vehicle category not found");
    }

    const rows = await this.categoriesRepository.findPublicLuggage(categoryId);
    return rows.map((row) => ({
      id: row.luggageType.id,
      name: row.luggageType.name,
      description: row.luggageType.description,
      dimensions: row.luggageType.dimensions,
      image: row.luggageType.image,
      price: row.luggageType.price?.toNumber() ?? null,
      maxQuantity: row.quantity,
    }));
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
          models: category.models,
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
        const overageMiles = Math.max(0, distance - pricing.includedDistance);
        const amount = pricing.basePrice.toNumber() + overageMiles * pricing.extraDistanceRate;
        return {
          id: category.id,
          name: category.name,
          models: category.models,
          description: category.description,
          image: category.image,
          passengerCount: category.passengerCount,
          luggageCount: category.luggageCapacity.reduce((total, item) => total + item.quantity, 0),
          basePrice: roundAmount(amount),
        };
      });
  }
}
