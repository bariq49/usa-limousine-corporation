import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { BulkDeleteDto } from "../dto/bulk-delete.dto";
import type { CreatePricingDto } from "../dto/create-pricing.dto";
import type { PricingQueryDto } from "../dto/pricing-query.dto";
import type { UpdatePricingDto } from "../dto/update-pricing.dto";
import { CategoriesRepository } from "../repositories/categories.repository";
import { PricingRepository } from "../repositories/pricing.repository";

@Injectable()
export class PricingService {
  constructor(
    @Inject(PricingRepository)
    private readonly pricingRepository: PricingRepository,
    @Inject(CategoriesRepository)
    private readonly categoriesRepository: CategoriesRepository,
  ) {}

  async create(body: CreatePricingDto) {
    const category = await this.categoriesRepository.findById(body.vehicleCategoryId);
    if (!category) {
      throw new NotFoundException("Vehicle category not found");
    }

    if (
      body.maximumDistance !== undefined &&
      body.maximumDistance !== null &&
      body.maximumDistance <= body.minimumDistance
    ) {
      throw new BadRequestException("maximumDistance must be greater than minimumDistance");
    }

    if (body.status !== "INACTIVE") {
      const overlap = await this.pricingRepository.findOverlapping({
        vehicleCategoryId: body.vehicleCategoryId,
        minimumDistance: body.minimumDistance,
        maximumDistance: body.maximumDistance ?? null,
      });
      if (overlap) {
        throw new ConflictException("This distance range overlaps an active pricing tier");
      }
    }

    return this.pricingRepository.create(body);
  }

  async findAll(query: PricingQueryDto) {
    return this.pricingRepository.findMany(query);
  }

  async findById(id: string) {
    const pricing = await this.pricingRepository.findById(id);
    if (!pricing) {
      throw new NotFoundException("Vehicle category pricing not found");
    }
    return pricing;
  }

  async findForDistance(vehicleCategoryId: string, distance: number) {
    return this.pricingRepository.findForDistance(vehicleCategoryId, distance);
  }

  async update(id: string, body: UpdatePricingDto) {
    const existing = await this.pricingRepository.findById(id);
    if (!existing) {
      throw new NotFoundException("Vehicle category pricing not found");
    }

    if (body.vehicleCategoryId && body.vehicleCategoryId !== existing.vehicleCategoryId) {
      const category = await this.categoriesRepository.findById(body.vehicleCategoryId);
      if (!category) {
        throw new NotFoundException("Vehicle category not found");
      }
    }

    const minDistance =
      body.minimumDistance !== undefined ? body.minimumDistance : existing.minimumDistance;

    const maxDistance =
      body.maximumDistance !== undefined ? body.maximumDistance : existing.maximumDistance;

    if (maxDistance !== null && maxDistance <= minDistance) {
      throw new BadRequestException("maximumDistance must be greater than minimumDistance");
    }

    const status = body.status ?? existing.status;
    if (status !== "INACTIVE") {
      const overlap = await this.pricingRepository.findOverlapping({
        vehicleCategoryId: body.vehicleCategoryId ?? existing.vehicleCategoryId,
        minimumDistance: minDistance,
        maximumDistance: maxDistance,
        excludeId: id,
      });
      if (overlap) {
        throw new ConflictException("This distance range overlaps an active pricing tier");
      }
    }

    return this.pricingRepository.update(id, body);
  }

  async remove(id: string) {
    const existing = await this.pricingRepository.findById(id);
    if (!existing) {
      throw new NotFoundException("Vehicle category pricing not found");
    }
    return this.pricingRepository.delete(id);
  }

  async bulkRemove(body: BulkDeleteDto) {
    const result = await this.pricingRepository.bulkDelete(body.ids);
    return {
      deletedCount: result.count,
    };
  }
}

export { PricingService as VehicleCategoryPricingService };
