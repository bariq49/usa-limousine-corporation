import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import {
  DriverApprovalStatus,
  DriverShiftEndedReason,
  DriverStatus,
  NotificationType,
} from "@prisma/client";
import * as argon2 from "argon2";
import { randomBytes } from "crypto";
import type { Request } from "express";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { auditLog } from "../../../common/utils/audit-log";
import { toRequestContext } from "../../../common/utils/to-request-context";
import { ACTIVITY_TYPE } from "../../activity/constants/activity.constants";
import { ActivityService } from "../../activity/services/activity.service";
import { OwnerType } from "../../activity/types/activity";
import { NotificationService } from "../../notification/services/notification.service";
import { RecipientType } from "../../notification/types/notification";
import { SessionsService } from "../../sessions/services/sessions.service";
import { UsersService } from "../../users/users.service";
import type { ApplicationQueryDto, BulkDeleteApplicationsDto } from "../dto/application.dto";
import { DriverEmailService } from "./driver-email.service";
import { DriverApplicationRepository } from "../repositories/application.repository";
import { DriverPresenceRepository } from "../repositories/presence.repository";
import { DriverRepository } from "../repositories/driver.repository";
import { VEHICLE_DOCUMENT_FIELDS } from "../constants/driver.constants";

function createDriverLoginPassword(): string {
  return `Am${randomBytes(9).toString("base64url")}!1`;
}

@Injectable()
export class DriverApplicationService {
  constructor(
    @Inject(DriverRepository) private readonly driverRepository: DriverRepository,
    @Inject(DriverApplicationRepository)
    private readonly applicationRepository: DriverApplicationRepository,
    @Inject(DriverPresenceRepository)
    private readonly presenceRepository: DriverPresenceRepository,
    @Inject(DriverEmailService) private readonly driverEmails: DriverEmailService,
    @Inject(NotificationService) private readonly notifications: NotificationService,
    @Inject(ActivityService) private readonly activities: ActivityService,
    @Inject(SessionsService) private readonly sessions: SessionsService,
    @Inject(UsersService) private readonly usersService: UsersService,
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  list(query: ApplicationQueryDto) {
    return this.applicationRepository.findMany(query);
  }

  async getOverview(id: string) {
    const driver = await this.applicationRepository.findById(id);
    if (!driver) {
      throw new NotFoundException("Driver application not found");
    }
    return driver;
  }

  async getReviews(id: string) {
    const driver = await this.applicationRepository.findById(id);
    if (!driver) {
      throw new NotFoundException("Driver application not found");
    }
    const reviews = await this.driverRepository.listReviews(driver.id);

    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    for (const review of reviews) {
      const key = review.rating as keyof typeof ratingDistribution;
      if (key in ratingDistribution) {
        ratingDistribution[key] += 1;
      }
    }

    return {
      summary: {
        averageRating: Number((driver.ratingAvg ?? 0).toFixed(2)),
        totalReviews: driver.ratingCount,
        ratingDistribution,
      },
      reviews: reviews.map((review) => {
        const passenger = review.trip.booking.passenger as { name?: string } | null;
        const address = review.trip.booking.address as {
          pickup?: { address?: string };
          dropoff?: { address?: string };
        } | null;
        const first = review.customer.user.firstName?.trim() ?? "";
        const last = review.customer.user.lastName?.trim() ?? "";
        const name = passenger?.name?.trim() || `${first} ${last}`.trim() || "Customer";
        const pickup = address?.pickup?.address?.trim();
        const dropoff = address?.dropoff?.address?.trim();
        const route = pickup && dropoff ? `${pickup} -> ${dropoff}` : (pickup ?? dropoff ?? null);

        return {
          id: review.id,
          passenger: {
            name,
            avatarUrl: review.customer.user.avatar,
          },
          route,
          time: review.createdAt,
          rating: review.rating,
          comment: review.comment,
        };
      }),
    };
  }

  async getVehicle(id: string) {
    const driver = await this.applicationRepository.findById(id);
    if (!driver) {
      throw new NotFoundException("Driver application not found");
    }

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
        quantity: capacity.quantity,
        dimensions: capacity.luggageType.dimensions,
      })),
      images,
    };
  }

  async markUnderReview(id: string, request: Request) {
    const context = toRequestContext(request);
    const driver = await this.driverRepository.findById(id);
    if (!driver) {
      throw new NotFoundException("Driver not found");
    }
    if (driver.approvalStatus !== DriverApprovalStatus.PENDING) {
      throw new BadRequestException("Only pending driver applications can be marked under review");
    }

    const updated = await this.applicationRepository.markUnderReview(id);
    if (!updated) {
      throw new NotFoundException("Driver not found");
    }
    await this.driverEmails.sendApplicationStatusEmail({
      email: driver.email,
      status: "UNDER_REVIEW",
    });
    await this.notifications.notify({
      recipientType: RecipientType.DRIVER,
      recipientId: updated.id,
      type: NotificationType.APPLICATION_UNDER_REVIEW,
      title: "Application under review",
      body: `Application ${updated.applicationNumber} is under review.`,
      data: {
        type: "APPLICATION_UNDER_REVIEW",
        payload: {
          driverId: updated.id,
          applicationNumber: updated.applicationNumber,
          approvalStatus: DriverApprovalStatus.UNDER_REVIEW,
        },
      },
      push: true,
    });

    await auditLog({
      prisma: this.prisma,
      event: "driver.application_under_review",
      result: "success",
      context,
      userId: context.userId,
      metadata: {
        driverId: updated.id,
        applicationNumber: updated.applicationNumber,
      },
    });

    await this.activities.record({
      ownerType: OwnerType.DRIVER,
      ownerId: updated.id,
      type: ACTIVITY_TYPE.APPLICATION_UNDER_REVIEW,
      actorType: OwnerType.USER,
      actorId: context.userId,
    });

    return updated;
  }

  async approve(id: string, request: Request) {
    const context = toRequestContext(request);
    const driver = await this.driverRepository.findById(id);
    if (!driver) {
      throw new NotFoundException("Driver not found");
    }
    if (driver.approvalStatus !== DriverApprovalStatus.UNDER_REVIEW) {
      throw new BadRequestException("Only applications under review can be approved");
    }

    const updated = await this.applicationRepository.approve(id);
    if (!updated) {
      throw new NotFoundException("Driver not found");
    }
    const password = createDriverLoginPassword();
    await this.usersService.updatePassword({
      userId: driver.userId,
      passwordHash: await argon2.hash(password),
    });
    await this.driverEmails.sendDriverCredentialsEmail({
      email: driver.email,
      password,
    });
    await this.notifications.notify({
      recipientType: RecipientType.DRIVER,
      recipientId: updated.id,
      type: NotificationType.APPLICATION_APPROVED,
      title: "Application approved",
      body: `Application ${updated.applicationNumber} was approved. Check your email for login details.`,
      data: {
        type: "APPLICATION_APPROVED",
        payload: {
          driverId: updated.id,
          applicationNumber: updated.applicationNumber,
          approvalStatus: DriverApprovalStatus.APPROVED,
        },
      },
      push: true,
    });

    await auditLog({
      prisma: this.prisma,
      event: "driver.application_approved",
      result: "success",
      context,
      userId: context.userId,
      metadata: {
        driverId: updated.id,
        applicationNumber: updated.applicationNumber,
        documentsApproved: true,
      },
    });

    await this.activities.record({
      ownerType: OwnerType.DRIVER,
      ownerId: updated.id,
      type: ACTIVITY_TYPE.APPLICATION_APPROVED,
      actorType: OwnerType.USER,
      actorId: context.userId,
    });

    return updated;
  }

  async reject(id: string, reason: string, request: Request) {
    const context = toRequestContext(request);
    const driver = await this.driverRepository.findById(id);
    if (!driver) {
      throw new NotFoundException("Driver not found");
    }
    if (driver.approvalStatus !== DriverApprovalStatus.UNDER_REVIEW) {
      throw new BadRequestException("Only applications under review can be rejected");
    }

    const updated = await this.applicationRepository.reject(id, reason);
    if (!updated) {
      throw new NotFoundException("Driver not found");
    }
    await this.driverEmails.sendApplicationStatusEmail({
      email: driver.email,
      status: "REJECTED",
      reason,
    });

    await auditLog({
      prisma: this.prisma,
      event: "driver.application_rejected",
      result: "success",
      context,
      userId: context.userId,
      metadata: {
        driverId: updated.id,
        applicationNumber: updated.applicationNumber,
        reason,
      },
    });

    await this.activities.record({
      ownerType: OwnerType.DRIVER,
      ownerId: updated.id,
      type: ACTIVITY_TYPE.APPLICATION_REJECTED,
      actorType: OwnerType.USER,
      actorId: context.userId,
      data: { reason },
    });

    return updated;
  }

  async suspend(id: string, request: Request) {
    const context = toRequestContext(request);
    const driver = await this.driverRepository.findById(id);
    if (!driver) {
      throw new NotFoundException("Driver not found");
    }
    if (driver.approvalStatus !== DriverApprovalStatus.APPROVED) {
      throw new BadRequestException("Only approved drivers can be suspended");
    }
    if (driver.status === DriverStatus.SUSPENDED) {
      throw new BadRequestException("Driver is already suspended");
    }

    const blockingTrips = await this.applicationRepository.countBlockingTrips(id);
    if (blockingTrips > 0) {
      throw new BadRequestException(
        "Cannot suspend driver while they have active or upcoming trips",
      );
    }

    await this.presenceRepository.goOffline({
      driverId: driver.id,
      endedReason: DriverShiftEndedReason.ADMIN,
      now: new Date(),
    });

    const updated = await this.applicationRepository.suspend(id, driver.userId);
    if (!updated) {
      throw new NotFoundException("Driver not found");
    }

    await this.sessions.revokeAll({ userId: driver.userId });

    await auditLog({
      prisma: this.prisma,
      event: "driver.suspended",
      result: "success",
      context,
      userId: context.userId,
      metadata: {
        driverId: updated.id,
        applicationNumber: updated.applicationNumber,
        previousStatus: driver.status,
      },
    });

    await this.activities.record({
      ownerType: OwnerType.DRIVER,
      ownerId: updated.id,
      type: ACTIVITY_TYPE.SUSPENDED,
      actorType: OwnerType.USER,
      actorId: context.userId,
    });

    return updated;
  }

  async unsuspend(id: string, request: Request) {
    const context = toRequestContext(request);
    const driver = await this.driverRepository.findById(id);
    if (!driver) {
      throw new NotFoundException("Driver not found");
    }
    if (driver.approvalStatus !== DriverApprovalStatus.APPROVED) {
      throw new BadRequestException("Only approved drivers can be unsuspended");
    }
    if (driver.status !== DriverStatus.SUSPENDED) {
      throw new BadRequestException("Driver is not suspended");
    }

    const updated = await this.applicationRepository.unsuspend(id, driver.userId);
    if (!updated) {
      throw new NotFoundException("Driver not found");
    }

    await auditLog({
      prisma: this.prisma,
      event: "driver.unsuspended",
      result: "success",
      context,
      userId: context.userId,
      metadata: {
        driverId: updated.id,
        applicationNumber: updated.applicationNumber,
      },
    });

    await this.activities.record({
      ownerType: OwnerType.DRIVER,
      ownerId: updated.id,
      type: ACTIVITY_TYPE.UNSUSPENDED,
      actorType: OwnerType.USER,
      actorId: context.userId,
    });

    return updated;
  }

  async remove(id: string, request: Request) {
    const context = toRequestContext(request);
    const driver = await this.applicationRepository.findById(id);
    if (!driver) {
      throw new NotFoundException("Driver application not found");
    }

    const blockingTrips = await this.applicationRepository.countBlockingTrips(id);
    if (blockingTrips > 0) {
      throw new BadRequestException(
        "Cannot delete driver while they have active or upcoming trips",
      );
    }

    await this.presenceRepository.goOffline({
      driverId: driver.id,
      endedReason: DriverShiftEndedReason.ADMIN,
      now: new Date(),
    });
    await this.sessions.revokeAll({ userId: driver.userId });
    await this.applicationRepository.purge(driver.id, driver.userId);

    await auditLog({
      prisma: this.prisma,
      event: "driver.permanently_deleted",
      result: "success",
      context,
      userId: context.userId,
      metadata: {
        driverId: driver.id,
        applicationNumber: driver.applicationNumber,
        hardDeleted: true,
      },
    });

    return { message: "Driver deleted permanently", id };
  }

  async bulkRemove(body: BulkDeleteApplicationsDto, request: Request) {
    const context = toRequestContext(request);
    const ids = [...new Set(body.ids)];
    const drivers = await this.applicationRepository.findUserIdsByDriverIds(ids);
    if (drivers.length !== ids.length) {
      throw new BadRequestException("One or more driver applications were not found");
    }

    for (const driver of drivers) {
      const blockingTrips = await this.applicationRepository.countBlockingTrips(driver.id);
      if (blockingTrips > 0) {
        throw new BadRequestException(
          "Cannot delete drivers while one or more have active or upcoming trips",
        );
      }
    }

    for (const driver of drivers) {
      await this.presenceRepository.goOffline({
        driverId: driver.id,
        endedReason: DriverShiftEndedReason.ADMIN,
        now: new Date(),
      });
      await this.sessions.revokeAll({ userId: driver.userId });
      await this.applicationRepository.purge(driver.id, driver.userId);
    }

    await auditLog({
      prisma: this.prisma,
      event: "driver.applications_bulk_deleted",
      result: "success",
      context,
      userId: context.userId,
      metadata: {
        driverIds: ids,
        deletedCount: ids.length,
        hardDeleted: true,
      },
    });

    return {
      message: "Driver applications deleted permanently",
      deletedCount: ids.length,
      ids,
    };
  }
}
