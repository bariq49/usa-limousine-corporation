import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { BulkDeleteDto } from "../dto/bulk-delete.dto";
import type { CreateDto } from "../dto/create-luggage.dto";
import type { QueryDto } from "../dto/luggage-query.dto";
import type { UpdateLuggageDto } from "../dto/update-luggage.dto";
import { LuggageRepository } from "../repositories/luggage.repository";

@Injectable()
export class LuggageService {
  constructor(
    @Inject(LuggageRepository)
    private readonly luggageRepository: LuggageRepository,
  ) {}

  async findAll(query: QueryDto) {
    return this.luggageRepository.findMany(query);
  }

  async findById(id: string) {
    const luggage = await this.luggageRepository.findById(id);
    if (!luggage) {
      throw new NotFoundException("Luggage not found");
    }
    return luggage;
  }

  async createStandard(body: CreateDto) {
    return this.create(body, false);
  }

  async createSpecial(body: CreateDto) {
    return this.create(body, true);
  }

  async update(id: string, body: UpdateLuggageDto) {
    const existing = await this.luggageRepository.findById(id);
    if (!existing) {
      throw new NotFoundException("Luggage not found");
    }

    return this.luggageRepository.update(id, body);
  }

  async remove(id: string) {
    const existing = await this.luggageRepository.findById(id);
    if (!existing) {
      throw new NotFoundException("Luggage not found");
    }

    await this.ensureNotInUse([id]);
    return this.luggageRepository.delete(id);
  }

  async bulkRemove(body: BulkDeleteDto) {
    const ids = [...new Set(body.ids)];
    const count = await this.luggageRepository.countByIds(ids);
    if (count !== ids.length) {
      throw new BadRequestException("One or more luggage items were not found");
    }

    await this.ensureNotInUse(ids);
    const result = await this.luggageRepository.deleteMany(ids);
    return {
      message: "Luggage deleted",
      deletedCount: result.count,
      ids,
    };
  }

  private async create(body: CreateDto, isSpecial: boolean) {
    return this.luggageRepository.create(body, isSpecial);
  }

  private async ensureNotInUse(ids: string[]) {
    const [categoryUsages, driverUsages] = await Promise.all([
      this.luggageRepository.countCategoryUsages(ids),
      this.luggageRepository.countDriverUsages(ids),
    ]);

    if (categoryUsages > 0 || driverUsages > 0) {
      throw new BadRequestException(
        "Luggage cannot be deleted because it is assigned to vehicle categories or driver vehicles",
      );
    }
  }
}
