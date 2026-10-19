import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { BulkDeleteDto } from "./dto/bulk-delete.dto";
import type { QueryDto } from "./dto/query.dto";
import { VehicleRepository } from "./repositories/vehicle.repository";

@Injectable()
export class VehicleService {
  constructor(
    @Inject(VehicleRepository)
    private readonly vehicleRepository: VehicleRepository,
  ) {}

  findAll(query: QueryDto) {
    return this.vehicleRepository.findMany(query);
  }

  async findById(id: string) {
    const vehicle = await this.vehicleRepository.findById(id);
    if (!vehicle) {
      throw new NotFoundException("Vehicle not found");
    }
    return vehicle;
  }

  async remove(id: string) {
    const existing = await this.vehicleRepository.findById(id);
    if (!existing) {
      throw new NotFoundException("Vehicle not found");
    }
    await this.vehicleRepository.remove(id);
    return { success: true };
  }

  async bulkRemove(body: BulkDeleteDto) {
    await this.vehicleRepository.bulkRemove(body.ids);
    return { success: true };
  }
}
