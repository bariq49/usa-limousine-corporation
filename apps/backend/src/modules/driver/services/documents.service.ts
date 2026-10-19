import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { type DriverDocumentType } from "@prisma/client";
import type { Request } from "express";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { auditLog } from "../../../common/utils/audit-log";
import { formatDate, parseDate } from "../../../common/utils/format-date";
import { toRequestContext } from "../../../common/utils/to-request-context";
import { REQUIRED_DOCUMENT_FIELDS } from "../constants/driver.constants";
import type { UpdateDocumentsDto } from "../dto/documents.dto";
import { DriverDocumentsRepository } from "../repositories/documents.repository";
import { DriverRepository } from "../repositories/driver.repository";
import type { DriverVehicleDocumentItem } from "../types/vehicle";
import { requireDriver } from "../utils/require-driver";

@Injectable()
export class DriverDocumentsService {
  constructor(
    @Inject(DriverRepository) private readonly driverRepository: DriverRepository,
    @Inject(DriverDocumentsRepository)
    private readonly documentsRepository: DriverDocumentsRepository,
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  async getDocuments(request: Request) {
    const driver = await requireDriver(this.driverRepository, request);

    const documents = driver.documents ?? [];
    const required: Record<string, string | null> = {};
    for (const [field, documentType] of Object.entries(REQUIRED_DOCUMENT_FIELDS)) {
      const document = documents.find((item) => item.documentType === documentType);
      required[field] = document?.url ?? null;
    }

    return {
      required,
      kvkNo: driver.kvkNo ?? null,
      licenseExpiry: driver.licenseExpiry ? formatDate(driver.licenseExpiry, "UTC") : null,
    };
  }

  async updateDocuments(body: UpdateDocumentsDto, request: Request) {
    const context = toRequestContext(request);
    const driver = await requireDriver(this.driverRepository, request);

    const values = body as Record<string, string | undefined>;
    const documents: DriverVehicleDocumentItem[] = Object.entries(REQUIRED_DOCUMENT_FIELDS)
      .filter(([field]) => Boolean(values[field]))
      .map(([field, documentType]) => ({
        documentType: documentType as DriverDocumentType,
        url: values[field]!,
      }));
    if (documents.length === 0 && body.kvkNo === undefined && body.licenseExpiry === undefined) {
      throw new BadRequestException("At least one document is required");
    }

    const payload: {
      documents: DriverVehicleDocumentItem[];
      kvkNo?: string;
      licenseExpiry?: Date;
    } = { documents };
    if (body.kvkNo !== undefined) {
      payload.kvkNo = body.kvkNo;
    }
    if (body.licenseExpiry !== undefined) {
      payload.licenseExpiry = parseDate(body.licenseExpiry);
    }

    const updated = await this.documentsRepository.saveDocuments(driver.id, payload);
    if (!updated) {
      throw new NotFoundException("Driver not found");
    }

    await auditLog({
      prisma: this.prisma,
      event: "driver.documents_updated",
      result: "success",
      context,
      userId: context.userId,
      metadata: {
        driverId: updated.id,
        applicationNumber: updated.applicationNumber,
        documentTypes: documents.map((document) => document.documentType),
        kvkNo: body.kvkNo,
        licenseExpiry: body.licenseExpiry,
      },
    });

    return this.getDocuments(request);
  }
}
