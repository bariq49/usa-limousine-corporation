import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { BulkDeleteDto } from "../dto/bulk-delete.dto";
import type { CreateDto } from "../dto/create.dto";
import type { VehicleCategoryLuggageCapacityInput } from "../dto/luggage-capacity.dto";
import type { VehicleCategoryQueryDto } from "../dto/query.dto";
import type { UpdateDto } from "../dto/update.dto";
import { CategoriesRepository } from "../repositories/categories.repository";
import { LuggageRepository } from "../repositories/luggage.repository";

@Injectable()
export class CategoriesService {
  constructor(
    @Inject(CategoriesRepository)
    private readonly categoriesRepository: CategoriesRepository,
    @Inject(LuggageRepository)
    private readonly luggageRepository: LuggageRepository,
  ) {}

  async create(body: CreateDto) {
    const luggageCapacity = await this.validateLuggageCapacity(body.standardLuggageCapacity);
    return this.categoriesRepository.create(body, luggageCapacity);
  }

  async findAll(query: VehicleCategoryQueryDto) {
    return this.categoriesRepository.findMany(query);
  }

  async findById(id: string) {
    const category = await this.categoriesRepository.findById(id);
    if (!category) {
      throw new NotFoundException("Vehicle category not found");
    }
    return category;
  }

  async update(id: string, body: UpdateDto) {
    const existing = await this.categoriesRepository.findById(id);
    if (!existing) {
      throw new NotFoundException("Vehicle category not found");
    }

    const hasStandardLuggage = body.standardLuggageCapacity !== undefined;
    const luggageCapacity = hasStandardLuggage
      ? await this.validateLuggageCapacity(body.standardLuggageCapacity ?? [])
      : undefined;

    return this.categoriesRepository.update(id, body, luggageCapacity);
  }

  async remove(id: string) {
    const existing = await this.categoriesRepository.findById(id);
    if (!existing) {
      throw new NotFoundException("Vehicle category not found");
    }

    const linkedBookings = await this.categoriesRepository.countBookingsByCategoryIds([id]);
    if (linkedBookings > 0) {
      throw new BadRequestException(
        "Vehicle category cannot be deleted because it is used by one or more bookings",
      );
    }

    return this.categoriesRepository.delete(id);
  }

  async bulkRemove(body: BulkDeleteDto) {
    const ids = [...new Set(body.ids)];
    const activeCount = await this.categoriesRepository.countActiveByIds(ids);
    if (activeCount !== ids.length) {
      throw new BadRequestException("One or more vehicle categories were not found");
    }

    const linkedBookings = await this.categoriesRepository.countBookingsByCategoryIds(ids);
    if (linkedBookings > 0) {
      throw new BadRequestException(
        "One or more vehicle categories cannot be deleted because they are used by bookings",
      );
    }

    const result = await this.categoriesRepository.deleteMany(ids);
    return {
      message: "Vehicle categories deleted",
      deletedCount: result.count,
      ids,
    };
  }

  private async validateLuggageCapacity(
    standardLuggageCapacity: VehicleCategoryLuggageCapacityInput[],
  ): Promise<VehicleCategoryLuggageCapacityInput[]> {
    const luggageCapacity = standardLuggageCapacity;
    const luggageTypeIds = luggageCapacity.map((capacity) => capacity.luggageTypeId);

    if (new Set(luggageTypeIds).size !== luggageTypeIds.length) {
      throw new BadRequestException(
        "Luggage types may only be configured once per vehicle category",
      );
    }

    const luggageTypes = await this.luggageRepository.findByIds(luggageTypeIds);
    if (luggageTypes.length !== luggageTypeIds.length) {
      throw new BadRequestException("One or more luggage types are not active or do not exist");
    }

    return luggageCapacity;
  }
}
