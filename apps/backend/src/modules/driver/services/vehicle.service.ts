import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { type DriverDocumentType } from "@prisma/client";
import type { Request } from "express";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { auditLog } from "../../../common/utils/audit-log";
import { toRequestContext } from "../../../common/utils/to-request-context";
import { VEHICLE_DOCUMENT_FIELDS } from "../constants/driver.constants";
import type { UpdateVehicleDto } from "../dto/vehicle.dto";
import { DriverRepository } from "../repositories/driver.repository";
import { DriverVehicleRepository } from "../repositories/vehicle.repository";
import type { DriverVehicleDocumentItem } from "../types/vehicle";
import { requireDriver } from "../utils/require-driver";

@Injectable()
export class DriverVehicleService {
  constructor(
    @Inject(DriverRepository) private readonly driverRepository: DriverRepository,
    @Inject(DriverVehicleRepository)
    private readonly vehicleRepository: DriverVehicleRepository,
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  async getVehicle(request: Request) {
    const driver = await requireDriver(this.driverRepository, request);
    if (!driver.vehicle) {
      throw new NotFoundException("Vehicle not found");
    }

    const images: Record<string, string | null> = {};
    for (const [field, documentType] of Object.entries(VEHICLE_DOCUMENT_FIELDS)) {
      const document = (driver.documents ?? []).find((item) => item.documentType === documentType);
      images[field] = document?.url ?? null;
    }

    return {
      id: driver.vehicle.id,
      make: driver.vehicle.make,
      model: driver.vehicle.model,
      year: driver.vehicle.year,
      color: driver.vehicle.color,
      licensePlate: driver.vehicle.licensePlate,
      category: driver.vehicle.vehicleCategory
        ? {
            id: driver.vehicle.vehicleCategory.id,
            name: driver.vehicle.vehicleCategory.name,
            image: driver.vehicle.vehicleCategory.image,
            passengerCount: driver.vehicle.vehicleCategory.passengerCount,
          }
        : null,
      luggageCapacity: (driver.vehicle.luggageCapacity ?? []).map((capacity) => ({
        luggageTypeId: capacity.luggageTypeId,
        name: capacity.luggageType.name,
        image: capacity.luggageType.image,
        isSpecial: capacity.luggageType.isSpecial,
        quantity: capacity.quantity,
        price: capacity.luggageType.isSpecial ? capacity.luggageType.price : null,
      })),
      images,
    };
  }

  async updateVehicle(body: UpdateVehicleDto, request: Request) {
    const context = toRequestContext(request);
    const driver = await requireDriver(this.driverRepository, request);
    if (!driver.vehicle) {
      throw new NotFoundException("Vehicle not found");
    }

    const vehicle = driver.vehicle;
    const make = body.make ?? vehicle.make;
    const model = body.model ?? vehicle.model;
    const year = body.year ?? vehicle.year;
    const color = body.color !== undefined ? body.color : vehicle.color;
    const licensePlate = body.licensePlate ?? vehicle.licensePlate;
    const vehicleCategoryId = body.vehicleCategoryId ?? vehicle.vehicleCategoryId;
    const luggageCapacity =
      body.luggageCapacity ??
      vehicle.luggageCapacity.map((item) => ({
        luggageTypeId: item.luggageTypeId,
        quantity: item.quantity,
      }));

    const luggageTypeIds = luggageCapacity.map((item) => item.luggageTypeId);
    if (new Set(luggageTypeIds).size !== luggageTypeIds.length) {
      throw new BadRequestException("Each luggage type can only be added once");
    }

    const category = await this.prisma.vehicleCategory.findFirst({
      where: {
        id: vehicleCategoryId,
        isActive: true,
        deletedAt: null,
      },
      include: {
        luggageCapacity: {
          where: {
            luggageTypeId: { in: luggageTypeIds },
            luggageType: { isActive: true },
          },
        },
      },
    });
    if (!category) {
      throw new BadRequestException(
        "Selected vehicle category is not available. Choose an active category and try again.",
      );
    }

    const maxCapacityByLuggageTypeId = new Map(
      category.luggageCapacity.map((capacity) => [capacity.luggageTypeId, capacity.quantity]),
    );
    const invalidCapacity = luggageCapacity.find(
      (capacity) =>
        maxCapacityByLuggageTypeId.get(capacity.luggageTypeId) === undefined ||
        capacity.quantity > maxCapacityByLuggageTypeId.get(capacity.luggageTypeId)!,
    );
    if (invalidCapacity) {
      const maxQuantity = maxCapacityByLuggageTypeId.get(invalidCapacity.luggageTypeId);
      if (maxQuantity === undefined) {
        throw new BadRequestException(
          "One or more luggage types are not configured for the selected vehicle category. Use only luggage types available for this category.",
        );
      }
      throw new BadRequestException(
        `Luggage quantity for one or more types exceeds the maximum allowed for this vehicle category (max ${maxQuantity}).`,
      );
    }

    const values = body as Record<string, string | undefined>;
    const documents: DriverVehicleDocumentItem[] = Object.entries(VEHICLE_DOCUMENT_FIELDS)
      .filter(([field]) => Boolean(values[field]))
      .map(([field, documentType]) => ({
        documentType: documentType as DriverDocumentType,
        url: values[field]!,
      }));
    const updated = await this.vehicleRepository.saveVehicle(driver.id, {
      make,
      model,
      year,
      color,
      licensePlate,
      vehicleCategoryId: category.id,
      luggageCapacity,
      documents,
    });
    if (!updated) {
      throw new NotFoundException("Driver not found");
    }

    await auditLog({
      prisma: this.prisma,
      event: "driver.vehicle_updated",
      result: "success",
      context,
      userId: context.userId,
      metadata: {
        driverId: updated.id,
        applicationNumber: updated.applicationNumber,
        licensePlate,
        vehicleCategoryId: category.id,
        documentTypes: documents.map((document) => document.documentType),
      },
    });

    return this.getVehicle(request);
  }
}
