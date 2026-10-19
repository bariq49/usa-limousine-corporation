import { Inject, Injectable } from "@nestjs/common";
import { type Prisma } from "@prisma/client";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import type { SaveDriverVehicleData } from "../types/vehicle";
import { DriverRepository } from "./driver.repository";
import { saveDocumentsInTx } from "./save-documents";

@Injectable()
export class DriverVehicleRepository {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(DriverRepository) private readonly driverRepository: DriverRepository,
  ) {}

  async saveVehicle(driverId: string, data: SaveDriverVehicleData) {
    const now = new Date();
    const documentTypes = data.documents.map((document) => document.documentType);

    await this.prisma.$transaction(async (tx) => {
      const vehicle = await tx.driverVehicle.upsert({
        where: { driverId },
        create: {
          driverId,
          make: data.make,
          model: data.model,
          year: data.year,
          color: data.color,
          licensePlate: data.licensePlate,
          vehicleCategoryId: data.vehicleCategoryId,
        },
        update: {
          make: data.make,
          model: data.model,
          year: data.year,
          color: data.color,
          licensePlate: data.licensePlate,
          vehicleCategoryId: data.vehicleCategoryId,
          deletedAt: null,
        },
      });

      await tx.driverVehicleLuggageCapacity.deleteMany({
        where: { vehicleId: vehicle.id },
      });

      if (data.luggageCapacity.length > 0) {
        await tx.driverVehicleLuggageCapacity.createMany({
          data: data.luggageCapacity.map((item) => ({
            vehicleId: vehicle.id,
            luggageTypeId: item.luggageTypeId,
            quantity: item.quantity,
          })) as unknown as Prisma.DriverVehicleLuggageCapacityCreateManyInput[],
        });
      }

      await saveDocumentsInTx(tx, driverId, data.documents, documentTypes, now);

      if (data.onboardingStatus !== undefined) {
        await tx.driver.update({
          where: { id: driverId },
          data: {
            onboardingStatus: data.onboardingStatus,
            onboardingVehicle: true,
          },
        });
      }
    });

    return this.driverRepository.findById(driverId);
  }
}
