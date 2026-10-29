import { ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { BulkDeleteDto } from "../dto/bulk-delete.dto";
import type { CreateDto, QueryDto, UpdateDto } from "../dto/hourly-pricing.dto";
import { CategoriesRepository } from "../repositories/categories.repository";
import { HourlyPricingRepository } from "../repositories/hourly-pricing.repository";

const DUPLICATE_MESSAGE =
  "Hourly pricing with this duration already exists for this vehicle category";

@Injectable()
export class HourlyPricingService {
  constructor(
    @Inject(HourlyPricingRepository)
    private readonly hourlyPricingRepository: HourlyPricingRepository,
    @Inject(CategoriesRepository)
    private readonly categoriesRepository: CategoriesRepository,
  ) {}

  async create(body: CreateDto) {
    const category = await this.categoriesRepository.findById(body.vehicleCategoryId);
    if (!category) {
      throw new NotFoundException("Vehicle category not found");
    }

    const duplicate = await this.hourlyPricingRepository.findDuplicate(
      body.vehicleCategoryId,
      body.durationHours,
    );
    if (duplicate) {
      throw new ConflictException(DUPLICATE_MESSAGE);
    }

    return this.hourlyPricingRepository.create(body);
  }

  async findAll(query: QueryDto) {
    return this.hourlyPricingRepository.findMany(query);
  }

  async findById(id: string) {
    const pricing = await this.hourlyPricingRepository.findById(id);
    if (!pricing) {
      throw new NotFoundException("Hourly pricing not found");
    }
    return pricing;
  }

  async update(id: string, body: UpdateDto) {
    const existing = await this.hourlyPricingRepository.findById(id);
    if (!existing) {
      throw new NotFoundException("Hourly pricing not found");
    }

    if (body.vehicleCategoryId && body.vehicleCategoryId !== existing.vehicleCategoryId) {
      const category = await this.categoriesRepository.findById(body.vehicleCategoryId);
      if (!category) {
        throw new NotFoundException("Vehicle category not found");
      }
    }

    const duplicate = await this.hourlyPricingRepository.findDuplicate(
      body.vehicleCategoryId ?? existing.vehicleCategoryId,
      body.durationHours ?? existing.durationHours,
      id,
    );
    if (duplicate) {
      throw new ConflictException(DUPLICATE_MESSAGE);
    }

    return this.hourlyPricingRepository.update(id, body);
  }

  async remove(id: string) {
    const existing = await this.hourlyPricingRepository.findById(id);
    if (!existing) {
      throw new NotFoundException("Hourly pricing not found");
    }
    return this.hourlyPricingRepository.delete(id);
  }

  async bulkRemove(body: BulkDeleteDto) {
    const result = await this.hourlyPricingRepository.bulkDelete(body.ids);
    return {
      deletedCount: result.count,
    };
  }
}
