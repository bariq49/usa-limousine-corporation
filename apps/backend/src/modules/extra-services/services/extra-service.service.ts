import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { BulkDeleteDto } from "../dto/bulk-delete.dto";
import type { CreateDto } from "../dto/create.dto";
import type { QueryDto } from "../dto/query.dto";
import type { UpdateDto } from "../dto/update.dto";
import { ExtraServiceRepository } from "../repositories/extra-service.repository";

@Injectable()
export class ExtraServiceService {
  constructor(
    @Inject(ExtraServiceRepository)
    private readonly repository: ExtraServiceRepository,
  ) {}

  async findAll(query: QueryDto) {
    return this.repository.findMany(query);
  }

  async findActive() {
    return this.repository.findActive();
  }

  async findById(id: string) {
    const item = await this.repository.findById(id);
    if (!item) {
      throw new NotFoundException("Service not found");
    }
    return item;
  }

  async create(body: CreateDto) {
    return this.repository.create(body);
  }

  async update(id: string, body: UpdateDto) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException("Service not found");
    }
    return this.repository.update(id, body);
  }

  async remove(id: string) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException("Service not found");
    }
    return this.repository.delete(id);
  }

  async bulkRemove(body: BulkDeleteDto) {
    const ids = [...new Set(body.ids)];
    const count = await this.repository.countByIds(ids);
    if (count !== ids.length) {
      throw new BadRequestException("One or more services were not found");
    }
    const result = await this.repository.deleteMany(ids);
    return {
      message: "Services deleted",
      deletedCount: result.count,
      ids,
    };
  }
}
