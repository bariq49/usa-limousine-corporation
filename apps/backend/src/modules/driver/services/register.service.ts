import { randomBytes } from "crypto";
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  DriverOnboardingStatus,
  type DriverDocumentType,
  DriverShift,
  RoleKey,
} from "@prisma/client";
import * as argon2 from "argon2";
import type { Request } from "express";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { SequenceService } from "../../../infrastructure/sequence/sequence.service";
import { auditLog } from "../../../common/utils/audit-log";
import { toRequestContext } from "../../../common/utils/to-request-context";
import { AuthEmailService } from "../../auth/services/auth-email.service";
import { RolesService } from "../../roles/services/roles.service";
import { UsersService } from "../../users/users.service";
import { REQUIRED_DOCUMENT_FIELDS, VEHICLE_DOCUMENT_FIELDS } from "../constants/driver.constants";
import type { DocumentsDto } from "../dto/documents.dto";
import type { CreateDto, DetailsDto, ResendOtpDto, VerifyEmailDto } from "../dto/register.dto";
import type { VehicleDto } from "../dto/vehicle.dto";
import { DriverEmailService } from "./driver-email.service";
import { DriverDocumentsRepository } from "../repositories/documents.repository";
import { DriverRepository } from "../repositories/driver.repository";
import { DriverRegisterRepository } from "../repositories/register.repository";
import { DriverVehicleRepository } from "../repositories/vehicle.repository";
import type { DriverProgress, OnboardingStep, SaveDriverDetailsData } from "../types/register";
import type { DriverVehicleDocumentItem } from "../types/vehicle";
import { parseDate } from "../../../common/utils/format-date";
import { hashToken } from "../../auth/utils/hash-token";

@Injectable()
export class DriverRegisterService {
  constructor(
    @Inject(DriverRepository) private readonly driverRepository: DriverRepository,
    @Inject(DriverRegisterRepository)
    private readonly registerRepository: DriverRegisterRepository,
    @Inject(DriverVehicleRepository)
    private readonly vehicleRepository: DriverVehicleRepository,
    @Inject(DriverDocumentsRepository)
    private readonly documentsRepository: DriverDocumentsRepository,
    @Inject(UsersService) private readonly usersService: UsersService,
    @Inject(RolesService) private readonly rolesService: RolesService,
    @Inject(SequenceService) private readonly sequenceService: SequenceService,
    @Inject(AuthEmailService) private readonly authEmails: AuthEmailService,
    @Inject(DriverEmailService) private readonly driverEmails: DriverEmailService,
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  async create(body: CreateDto, request: Request) {
    const context = toRequestContext(request);
    const { email, firstName, lastName, phone } = body;

    let memberUser = await this.usersService.findByEmail({ email });
    if (!memberUser) {
      const passwordHash = await argon2.hash(randomBytes(24).toString("hex"));
      memberUser = await this.usersService.create({
        email,
        passwordHash,
      });
    }

    let driver = await this.driverRepository.findByUserId(memberUser.id);

    if (driver) {
      const progress: DriverProgress = {
        personal: driver.onboardingPersonal,
        emailVerified: driver.onboardingEmailVerified,
        details: driver.onboardingDetails,
        vehicle: driver.onboardingVehicle,
        documents: driver.onboardingDocuments,
      };

      let nextStep: OnboardingStep = "completed";
      if (!progress.emailVerified) {
        nextStep = "verify-email";
      } else if (!progress.details) {
        nextStep = "details";
      } else if (!progress.vehicle) {
        nextStep = "vehicle";
      } else if (!progress.documents) {
        nextStep = "documents";
      }

      if (nextStep === "completed") {
        throw new ConflictException(
          "An account already exists for this email. Please log in to continue.",
        );
      }

      if (nextStep === "verify-email") {
        await this.authEmails.sendVerificationEmail({
          userId: memberUser.id,
          email: memberUser.email,
        });

        return {
          message: "A verification code has been sent to your email. Please verify to continue.",
          id: driver.id,
          email: memberUser.email,
          applicationNumber: driver.applicationNumber,
          progress,
          nextStep,
        };
      }

      return {
        message: "Welcome back. Continue your registration from where you left off.",
        id: driver.id,
        email: memberUser.email,
        applicationNumber: driver.applicationNumber,
        progress,
        nextStep,
      };
    }

    const applicationNumber = await this.sequenceService.allocate({
      counterId: "global",
      prefix: "APP-",
      pad: 6,
    });

    driver = await this.registerRepository.create({
      userId: memberUser.id,
      applicationNumber,
      firstName,
      lastName,
      email,
      phone,
    });
    if (!driver) {
      throw new NotFoundException("Driver not found");
    }

    await this.rolesService.assignRoles({ userId: memberUser.id, keys: [RoleKey.DRIVER] });

    await auditLog({
      prisma: this.prisma,
      event: "driver.created",
      result: "success",
      context,
      userId: memberUser.id,
      metadata: {
        driverId: driver.id,
        applicationNumber: driver.applicationNumber,
        memberUserId: memberUser.id,
      },
    });

    await this.authEmails.sendVerificationEmail({
      userId: memberUser.id,
      email: memberUser.email,
    });

    const progress: DriverProgress = {
      personal: driver.onboardingPersonal,
      emailVerified: driver.onboardingEmailVerified,
      details: driver.onboardingDetails,
      vehicle: driver.onboardingVehicle,
      documents: driver.onboardingDocuments,
    };

    return {
      message: "A verification code has been sent to your email. Please verify to continue.",
      id: driver.id,
      email: memberUser.email,
      applicationNumber: driver.applicationNumber,
      progress,
      nextStep: "verify-email",
    };
  }

  async verifyEmail(body: VerifyEmailDto, request: Request) {
    const context = toRequestContext(request);
    const { email, token } = body;

    const memberUser = await this.usersService.findByEmail({ email });
    if (!memberUser) {
      throw new BadRequestException("Invalid verification token");
    }

    const driver = await this.driverRepository.findByUserId(memberUser.id);
    if (!driver) {
      throw new NotFoundException("Driver not found");
    }

    if (!driver.onboardingEmailVerified) {
      const verification = await this.prisma.emailVerificationToken.findFirst({
        where: {
          userId: memberUser.id,
          tokenHash: hashToken(token.trim()),
          consumedAt: null,
          expiresAt: { gt: new Date() },
        },
      });
      if (!verification && !memberUser.isEmailVerified) {
        throw new BadRequestException("Invalid verification token");
      }

      await this.prisma.$transaction(async (tx) => {
        if (verification) {
          await tx.emailVerificationToken.updateMany({
            where: { userId: memberUser.id, consumedAt: null },
            data: { consumedAt: new Date() },
          });
        }

        if (!memberUser.isEmailVerified) {
          await tx.user.update({
            where: { id: memberUser.id },
            data: { isEmailVerified: true },
          });
        }

        await tx.driver.update({
          where: { id: driver.id },
          data: {
            onboardingEmailVerified: true,
            onboardingStatus:
              driver.onboardingStatus === DriverOnboardingStatus.NOT_STARTED
                ? DriverOnboardingStatus.IN_PROGRESS
                : driver.onboardingStatus,
          },
        });
      });

      await auditLog({
        prisma: this.prisma,
        event: "driver.email_verified",
        context,
        userId: memberUser.id,
        result: "success",
        metadata: { driverId: driver.id },
      });
    }

    const progress: DriverProgress = {
      personal: driver.onboardingPersonal,
      emailVerified: true,
      details: driver.onboardingDetails,
      vehicle: driver.onboardingVehicle,
      documents: driver.onboardingDocuments,
    };

    let nextStep: OnboardingStep = "completed";
    if (!progress.details) {
      nextStep = "details";
    } else if (!progress.vehicle) {
      nextStep = "vehicle";
    } else if (!progress.documents) {
      nextStep = "documents";
    }

    return {
      message: "Email verified",
      id: driver.id,
      progress,
      nextStep,
    };
  }

  async resendOtp(body: ResendOtpDto, request: Request) {
    const context = toRequestContext(request);
    const { email, channel } = body;
    const viaSms = channel === "sms";
    const sentMessage = viaSms
      ? "Verification code sent by SMS"
      : "Verification code sent to email";

    const memberUser = await this.usersService.findByEmail({ email });
    if (!memberUser) {
      return { message: sentMessage, channel: viaSms ? "sms" : "email" };
    }

    const driver = await this.driverRepository.findByUserId(memberUser.id);
    if (!driver) {
      throw new NotFoundException("Driver not found");
    }

    if (driver.onboardingEmailVerified) {
      return { message: sentMessage, channel: viaSms ? "sms" : "email" };
    }

    if (viaSms && !memberUser.phone?.trim()) {
      return { message: sentMessage, channel: "sms" };
    }

    await this.authEmails.sendVerificationEmail({
      userId: memberUser.id,
      email: memberUser.email,
      phone: memberUser.phone,
      channel: channel ?? "email",
    });

    await auditLog({
      prisma: this.prisma,
      event: "driver.otp_resent",
      context,
      userId: memberUser.id,
      result: "success",
      metadata: { driverId: driver.id, channel: channel ?? "email" },
    });

    return { message: sentMessage, channel: viaSms ? "sms" : "email" };
  }

  async saveDetails(id: string, body: DetailsDto, request: Request) {
    const context = toRequestContext(request);

    const driver = await this.driverRepository.findById(id);
    if (!driver) {
      throw new NotFoundException("Driver not found");
    }

    if (!driver.onboardingEmailVerified) {
      throw new BadRequestException("Verify email before submitting driver details");
    }

    if (body.shift !== DriverShift.FLEXIBLE && (!body.startTime || !body.endTime)) {
      throw new BadRequestException("startTime and endTime are required for DAY and NIGHT shifts");
    }

    const languageCodes = body.languages.map((item) => item.code);
    if (new Set(languageCodes).size !== languageCodes.length) {
      throw new BadRequestException("languages codes must be unique");
    }

    const details: SaveDriverDetailsData = {
      address: body.address,
      houseNo: body.houseNo,
      streetName: body.streetName,
      postalCode: body.postalCode,
      city: body.city,
      province: body.province,
      country: body.country,
      countryCode: body.countryCode,
      shift: body.shift,
      startTime: body.shift === DriverShift.FLEXIBLE ? null : (body.startTime ?? null),
      endTime: body.shift === DriverShift.FLEXIBLE ? null : (body.endTime ?? null),
      operatingCountry: body.operatingCountry,
      operatingCity: body.operatingCity,
      languages: body.languages.map((item) => ({
        code: item.code,
        fluency: item.fluency,
      })),
      dressesInSuit: body.dressesInSuit,
      services: body.services ?? [],
    };
    const updated = await this.registerRepository.saveDetails(driver.id, details);
    if (!updated) {
      throw new NotFoundException("Driver not found");
    }

    await auditLog({
      prisma: this.prisma,
      event: "driver.details_saved",
      result: "success",
      context,
      userId: driver.userId,
      metadata: {
        driverId: updated.id,
        applicationNumber: updated.applicationNumber,
        shift: updated.shift,
        languages: updated.languages?.map((item) => item.code) ?? [],
      },
    });

    return updated;
  }

  async saveVehicle(id: string, body: VehicleDto, request: Request) {
    const context = toRequestContext(request);

    const driver = await this.driverRepository.findById(id);
    if (!driver) {
      throw new NotFoundException("Driver not found");
    }

    if (!driver.onboardingEmailVerified) {
      throw new BadRequestException("Verify email before submitting vehicle details");
    }

    const luggageTypeIds = body.luggageCapacity.map((item) => item.luggageTypeId);
    if (new Set(luggageTypeIds).size !== luggageTypeIds.length) {
      throw new BadRequestException("Each luggage type can only be added once");
    }

    const category = await this.prisma.vehicleCategory.findFirst({
      where: {
        id: body.vehicleCategoryId,
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
    const invalidCapacity = body.luggageCapacity.find(
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

    const vehicleValues = body as unknown as Record<string, string | undefined>;
    const documents: DriverVehicleDocumentItem[] = Object.entries(VEHICLE_DOCUMENT_FIELDS)
      .filter(([field]) => Boolean(vehicleValues[field]))
      .map(([field, documentType]) => ({
        documentType: documentType as DriverDocumentType,
        url: vehicleValues[field]!,
      }));

    const updated = await this.vehicleRepository.saveVehicle(driver.id, {
      make: body.make,
      model: body.model,
      year: body.year,
      color: body.color ?? null,
      licensePlate: body.licensePlate,
      vehicleCategoryId: category.id,
      luggageCapacity: body.luggageCapacity,
      documents,
      onboardingStatus: DriverOnboardingStatus.IN_PROGRESS,
    });
    if (!updated) {
      throw new NotFoundException("Driver not found");
    }

    await auditLog({
      prisma: this.prisma,
      event: "driver.vehicle_saved",
      result: "success",
      context,
      userId: driver.userId,
      metadata: {
        driverId: updated.id,
        applicationNumber: updated.applicationNumber,
        licensePlate: body.licensePlate,
        vehicleCategoryId: category.id,
        documentTypes: documents.map((document) => document.documentType),
      },
    });

    return updated;
  }

  async saveDocuments(id: string, body: DocumentsDto, request: Request) {
    const context = toRequestContext(request);

    const driver = await this.driverRepository.findById(id);
    if (!driver) {
      throw new NotFoundException("Driver not found");
    }

    if (!driver.onboardingEmailVerified) {
      throw new BadRequestException("Verify email before submitting documents");
    }

    const documentValues = body as unknown as Record<string, string | undefined>;
    const documents: DriverVehicleDocumentItem[] = Object.entries(REQUIRED_DOCUMENT_FIELDS)
      .filter(([field]) => Boolean(documentValues[field]))
      .map(([field, documentType]) => ({
        documentType: documentType as DriverDocumentType,
        url: documentValues[field]!,
      }));
    const updated = await this.documentsRepository.saveDocuments(driver.id, {
      documents,
      kvkNo: body.kvkNo,
      licenseExpiry: parseDate(body.licenseExpiry),
      onboardingDocuments: true,
    });
    if (!updated) {
      throw new NotFoundException("Driver not found");
    }

    const vehicle = updated.vehicle;
    const vehicleSummary = vehicle
      ? [vehicle.year, vehicle.make, vehicle.model, vehicle.licensePlate].filter(Boolean).join(" ")
      : null;

    await this.driverEmails.sendApplicationReceivedEmails({
      driverEmail: updated.email,
      applicationNumber: updated.applicationNumber,
      firstName: updated.firstName,
      lastName: updated.lastName,
      email: updated.email,
      phone: updated.phone,
      homeAddress: updated.homeAddress,
      shift: updated.shift,
      startTime: updated.startTime,
      endTime: updated.endTime,
      operatingCountry: updated.operatingCountry,
      operatingCity: updated.operatingCity,
      vehicleSummary,
    });

    await auditLog({
      prisma: this.prisma,
      event: "driver.documents_saved",
      result: "success",
      context,
      userId: driver.userId,
      metadata: {
        driverId: updated.id,
        applicationNumber: updated.applicationNumber,
        documentTypes: documents.map((document) => document.documentType),
        kvkNo: body.kvkNo,
        licenseExpiry: body.licenseExpiry,
      },
    });

    return updated;
  }

  async getStatusByEmail(email: string) {
    if (!email) {
      throw new BadRequestException("Email is required");
    }

    const memberUser = await this.usersService.findByEmail({ email });
    if (!memberUser) {
      throw new NotFoundException("Driver application not found");
    }

    const driver = await this.driverRepository.findByUserId(memberUser.id);
    if (!driver) {
      throw new NotFoundException("Driver application not found");
    }

    const progress: DriverProgress = {
      personal: driver.onboardingPersonal,
      emailVerified: driver.onboardingEmailVerified,
      details: driver.onboardingDetails,
      vehicle: driver.onboardingVehicle,
      documents: driver.onboardingDocuments,
    };

    let nextStep: OnboardingStep = "completed";
    if (!progress.emailVerified) {
      nextStep = "verify-email";
    } else if (!progress.details) {
      nextStep = "details";
    } else if (!progress.vehicle) {
      nextStep = "vehicle";
    } else if (!progress.documents) {
      nextStep = "documents";
    }

    return {
      id: driver.id,
      applicationNumber: driver.applicationNumber,
      approvalStatus: driver.approvalStatus,
      onboardingStatus: driver.onboardingStatus,
      progress,
      nextStep,
    };
  }
}
