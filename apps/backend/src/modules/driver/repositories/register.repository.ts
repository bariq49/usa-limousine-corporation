import { Inject, Injectable } from "@nestjs/common";
import { DriverOnboardingStatus } from "@prisma/client";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import type { CreateDriverData, SaveDriverDetailsData } from "../types/register";
import { DriverRepository } from "./driver.repository";

@Injectable()
export class DriverRegisterRepository {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(DriverRepository) private readonly drivers: DriverRepository,
  ) {}

  async create(data: CreateDriverData) {
    const created = await this.prisma.driver.create({
      data: {
        userId: data.userId,
        applicationNumber: data.applicationNumber,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        onboardingPersonal: true,
        settings: { create: {} },
      },
    });
    return this.drivers.findById(created.id);
  }

  async saveDetails(id: string, data: SaveDriverDetailsData) {
    await this.prisma.$transaction(async (tx) => {
      await tx.driver.update({
        where: { id },
        data: {
          homeAddress: data.address,
          houseNo: data.houseNo,
          streetName: data.streetName,
          postalCode: data.postalCode,
          city: data.city,
          province: data.province,
          country: data.country,
          countryCode: data.countryCode,
          shift: data.shift,
          startTime: data.startTime,
          endTime: data.endTime,
          operatingCountry: data.operatingCountry,
          operatingCity: data.operatingCity,
          dressesInSuit: data.dressesInSuit,
          services: data.services ?? [],
          onboardingStatus: DriverOnboardingStatus.IN_PROGRESS,
          onboardingDetails: true,
        },
      });

      await tx.driverLanguage.deleteMany({ where: { driverId: id } });
      await tx.driverLanguage.createMany({
        data: data.languages.map((item) => ({
          driverId: id,
          code: item.code,
          fluency: item.fluency,
        })),
      });
    });

    return this.drivers.findById(id);
  }
}
