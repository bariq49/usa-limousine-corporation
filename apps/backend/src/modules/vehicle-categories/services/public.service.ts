import { Inject, Injectable } from "@nestjs/common";
import { PricingType } from "@prisma/client";
import { roundAmount } from "../../../common/utils/money";
import { PlatformSettingsService } from "../../platform-settings/services/platform-settings.service";
import { priceBreakdown } from "../../platform-settings/utils/pricing";
import type { DistanceQueryDto } from "../dto/distance-query.dto";
import type { LuggageQueryDto } from "../dto/luggage-query.dto";
import type { VehicleCategoryQueryDto } from "../dto/query.dto";
import { CategoriesRepository } from "../repositories/categories.repository";
import { LuggageRepository } from "../repositories/luggage.repository";
import { PricingRepository } from "../repositories/pricing.repository";

function luggageCount(capacity: { quantity: number }[]): number {
  return capacity.reduce((total, item) => total + item.quantity, 0);
}

@Injectable()
export class PublicService {
  constructor(
    @Inject(CategoriesRepository)
    private readonly categoriesRepository: CategoriesRepository,
    @Inject(LuggageRepository)
    private readonly luggageRepository: LuggageRepository,
    @Inject(PricingRepository)
    private readonly pricingRepository: PricingRepository,
    @Inject(PlatformSettingsService)
    private readonly platformSettingsService: PlatformSettingsService,
  ) {}

  async findCategories(query: VehicleCategoryQueryDto) {
    const page = await this.categoriesRepository.findPublicCatalog(query);
    page.data.forEach((category) =>
      Object.assign(category, { luggageCount: luggageCount(category.luggageCapacity) }),
    );
    return page;
  }

  async findLuggage(query: LuggageQueryDto) {
    return this.luggageRepository.findPublicMany(query);
  }

  async findCategoriesForDistance(query: DistanceQueryDto) {
    const distance = query.distance;
    const rates = await this.platformSettingsService.get();
    const categories = await this.categoriesRepository.findPublicActive();
    const pricings = await this.pricingRepository.findAllForDistance(
      distance,
      categories.map((c) => c.id),
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
        const price = this.computePrice({
          pricingType: pricing.pricingType,
          basePrice: pricing.basePrice.toNumber(),
          perUnitRate: pricing.perUnitRate?.toNumber() ?? null,
          percentageRate: pricing.percentageRate?.toNumber() ?? null,
          distance,
        });

        return {
          id: category.id,
          name: category.name,
          description: category.description,
          image: category.image,
          passengerCount: category.passengerCount,
          isActive: category.isActive,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt,
          deletedAt: category.deletedAt,
          luggageCapacity: category.luggageCapacity,
          luggageCount: luggageCount(category.luggageCapacity),
          distance,
          pricing: {
            id: pricing.id,
            minimumDistance: pricing.minimumDistance,
            maximumDistance: pricing.maximumDistance,
            pricingType: pricing.pricingType,
            basePrice: pricing.basePrice,
            perUnitRate: pricing.perUnitRate,
            percentageRate: pricing.percentageRate,
          },
          price,
          priceBreakdown: priceBreakdown(price, rates, Boolean(query.isAirport)),
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
    return this.computePrice({
      pricingType: pricing.pricingType,
      basePrice: pricing.basePrice.toNumber(),
      perUnitRate: pricing.perUnitRate?.toNumber() ?? null,
      percentageRate: pricing.percentageRate?.toNumber() ?? null,
      distance,
    });
  }

  private computePrice(params: {
    pricingType: PricingType;
    basePrice: number;
    perUnitRate: number | null;
    percentageRate: number | null;
    distance: number;
  }): number {
    if (params.pricingType === PricingType.PER_UNIT) {
      return roundAmount(params.basePrice + params.distance * (params.perUnitRate ?? 0));
    }
    if (params.pricingType === PricingType.PERCENTAGE) {
      return roundAmount(params.basePrice * (1 + (params.percentageRate ?? 0) / 100));
    }
    return roundAmount(params.basePrice);
  }
}
