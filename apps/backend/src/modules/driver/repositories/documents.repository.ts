import { Inject, Injectable } from "@nestjs/common";
import { DriverOnboardingStatus, type Prisma } from "@prisma/client";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import type { SaveDriverDocumentsData } from "../types/documents";
import { DriverRepository } from "./driver.repository";
import { saveDocumentsInTx } from "./save-documents";

@Injectable()
export class DriverDocumentsRepository {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(DriverRepository) private readonly driverRepository: DriverRepository,
  ) {}

  async saveDocuments(driverId: string, data: SaveDriverDocumentsData) {
    const now = new Date();
    const documentTypes = data.documents.map((document) => document.documentType);

    await this.prisma.$transaction(async (tx) => {
      await saveDocumentsInTx(tx, driverId, data.documents, documentTypes, now);

      if (
        !data.onboardingDocuments &&
        data.kvkNo === undefined &&
        data.licenseExpiry === undefined
      ) {
        return;
      }

      const updateData: Prisma.DriverUpdateInput = {};
      if (data.onboardingDocuments) {
        updateData.onboardingStatus = DriverOnboardingStatus.DOCUMENTS_PENDING;
        updateData.onboardingDocuments = true;
      }
      if (data.kvkNo !== undefined) {
        updateData.kvkNo = data.kvkNo;
      }
      if (data.licenseExpiry !== undefined) {
        updateData.licenseExpiry = data.licenseExpiry;
      }

      await tx.driver.update({
        where: { id: driverId },
        data: updateData,
      });
    });

    return this.driverRepository.findById(driverId);
  }
}
