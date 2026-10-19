import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { DriverDeleteStatus, DriverShift, DriverShiftEndedReason } from "@prisma/client";
import type { Request } from "express";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { auditLog } from "../../../common/utils/audit-log";
import { requireUserId, toRequestContext } from "../../../common/utils/to-request-context";
import { ACTIVITY_TYPE } from "../../activity/constants/activity.constants";
import { ActivityService } from "../../activity/services/activity.service";
import { OwnerType } from "../../activity/types/activity";
import { SessionsService } from "../../sessions/services/sessions.service";
import type {
  DeleteDto,
  DeleteQueryDto,
  RejectDeleteDto,
  UpdateProfileDto,
} from "../dto/profile.dto";
import { DriverRepository } from "../repositories/driver.repository";
import { DriverPresenceRepository } from "../repositories/presence.repository";
import { DriverProfileRepository } from "../repositories/profile.repository";
import type { UpdateDriverProfileData } from "../types/profile";
import { requireDriver } from "../utils/require-driver";

@Injectable()
export class DriverProfileService {
  constructor(
    @Inject(DriverRepository) private readonly driverRepository: DriverRepository,
    @Inject(DriverProfileRepository)
    private readonly profileRepository: DriverProfileRepository,
    @Inject(DriverPresenceRepository)
    private readonly presenceRepository: DriverPresenceRepository,
    @Inject(SessionsService) private readonly sessions: SessionsService,
    @Inject(ActivityService) private readonly activities: ActivityService,
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  async getProfile(request: Request) {
    const driver = await requireDriver(this.driverRepository, request);

    return {
      id: driver.id,
      avatarUrl: driver.avatarUrl,
      about: driver.about,
      firstName: driver.firstName,
      lastName: driver.lastName,
      email: driver.email,
      phone: driver.phone,
      address: driver.homeAddress,
      houseNo: driver.houseNo,
      streetName: driver.streetName,
      postalCode: driver.postalCode,
      city: driver.city,
      province: driver.province,
      country: driver.country,
      countryCode: driver.countryCode,
      yearsExperience: driver.yearsExperience,
      shift: driver.shift,
      startTime: driver.startTime,
      endTime: driver.endTime,
      dressesInSuit: driver.dressesInSuit,
      services: driver.services,
      languages: driver.languages,
    };
  }

  async getMe(request: Request) {
    const driver = await requireDriver(this.driverRepository, request);

    const tripsCompleted = await this.driverRepository.countCompletedTrips(driver.id);

    return {
      firstName: driver.firstName,
      lastName: driver.lastName,
      email: driver.email,
      avatar: driver.avatarUrl,
      memberSince: driver.createdAt,
      rating: Number((driver.ratingAvg ?? 0).toFixed(2)),
      tripsCompleted,
    };
  }

  async getReviews(request: Request) {
    const driver = await requireDriver(this.driverRepository, request);
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

  async updateProfile(body: UpdateProfileDto, request: Request) {
    const context = toRequestContext(request);
    const driver = await requireDriver(this.driverRepository, request);

    const shift = body.shift ?? driver.shift;
    const startTime =
      shift === DriverShift.FLEXIBLE
        ? null
        : body.startTime !== undefined
          ? body.startTime
          : driver.startTime;
    const endTime =
      shift === DriverShift.FLEXIBLE
        ? null
        : body.endTime !== undefined
          ? body.endTime
          : driver.endTime;

    if (shift !== DriverShift.FLEXIBLE && (!startTime || !endTime)) {
      throw new BadRequestException("startTime and endTime are required for DAY and NIGHT shifts");
    }

    if (body.languages !== undefined) {
      const codes = body.languages.map((item) => item.code);
      if (new Set(codes).size !== codes.length) {
        throw new BadRequestException("languages codes must be unique");
      }
    }

    const services = body.services ?? body.service;
    const data: UpdateDriverProfileData = {
      firstName: body.firstName ?? driver.firstName,
      lastName: body.lastName ?? driver.lastName,
      phone: body.phone !== undefined ? body.phone : driver.phone,
      avatarUrl: body.avatarUrl !== undefined ? body.avatarUrl : driver.avatarUrl,
      about: body.about !== undefined ? body.about : (driver.about ?? null),
      homeAddress: body.address !== undefined ? body.address : driver.homeAddress,
      houseNo: body.houseNo !== undefined ? body.houseNo : driver.houseNo,
      streetName: body.streetName !== undefined ? body.streetName : driver.streetName,
      postalCode: body.postalCode !== undefined ? body.postalCode : driver.postalCode,
      city: body.city !== undefined ? body.city : driver.city,
      province: body.province !== undefined ? body.province : driver.province,
      country: body.country !== undefined ? body.country : driver.country,
      countryCode: body.countryCode !== undefined ? body.countryCode : driver.countryCode,
      yearsExperience:
        body.yearsExperience !== undefined ? body.yearsExperience : driver.yearsExperience,
      shift,
      startTime,
      endTime,
      dressesInSuit: body.dressesInSuit !== undefined ? body.dressesInSuit : driver.dressesInSuit,
      services: services !== undefined ? services : (driver.services ?? []),
    };

    if (body.languages !== undefined) {
      data.languages = body.languages.map((item) => ({
        code: item.code,
        fluency: item.fluency,
      }));
    }

    const changedFields = Object.keys(body)
      .filter((key) => body[key as keyof UpdateProfileDto] !== undefined)
      .map((key) => (key === "service" ? "services" : key));

    await this.profileRepository.updateProfile(driver.id, data);

    const updated = await requireDriver(this.driverRepository, request);

    await auditLog({
      prisma: this.prisma,
      event: "driver.profile_updated",
      result: "success",
      context,
      userId: context.userId,
      metadata: {
        driverId: updated.id,
        applicationNumber: updated.applicationNumber,
        changedFields,
        languages:
          body.languages !== undefined ? body.languages.map((item) => item.code) : undefined,
      },
    });

    await this.activities.record({
      ownerType: OwnerType.DRIVER,
      ownerId: updated.id,
      type: ACTIVITY_TYPE.PROFILE_UPDATED,
      actorType: OwnerType.USER,
      actorId: context.userId,
      data: {
        changedFields,
      },
    });

    return {
      id: updated.id,
      avatarUrl: updated.avatarUrl,
      firstName: updated.firstName,
      lastName: updated.lastName,
      email: updated.email,
      phone: updated.phone,
      address: updated.homeAddress,
      houseNo: updated.houseNo,
      streetName: updated.streetName,
      postalCode: updated.postalCode,
      city: updated.city,
      province: updated.province,
      country: updated.country,
      countryCode: updated.countryCode,
      yearsExperience: updated.yearsExperience,
      shift: updated.shift,
      startTime: updated.startTime,
      endTime: updated.endTime,
      dressesInSuit: updated.dressesInSuit,
      services: updated.services,
      languages: updated.languages,
    };
  }

  async requestDelete(body: DeleteDto, request: Request) {
    const context = toRequestContext(request);
    const driver = await requireDriver(this.driverRepository, request);

    if (driver.deletedAt) {
      throw new BadRequestException("Account is already deleted");
    }

    const pending = await this.profileRepository.findPendingDeleteRequest(driver.id);
    if (pending) {
      throw new ConflictException("A delete request is already pending");
    }

    const blockingTrips = await this.profileRepository.countBlockingTrips(driver.id);
    if (blockingTrips > 0) {
      throw new BadRequestException(
        "Cannot request delete while you have active or upcoming trips",
      );
    }

    await this.presenceRepository.goOffline({
      driverId: driver.id,
      endedReason: DriverShiftEndedReason.DRIVER,
      now: new Date(),
    });

    const deleteRequest = await this.profileRepository.submitDeleteRequest(driver.id, body.reason);

    await auditLog({
      prisma: this.prisma,
      event: "driver.delete_requested",
      result: "success",
      context,
      userId: context.userId,
      metadata: {
        driverId: driver.id,
        applicationNumber: driver.applicationNumber,
        requestId: deleteRequest.id,
        previousStatus: deleteRequest.previousStatus,
        reason: deleteRequest.reason,
      },
    });

    const deleteRequestedPayload: Record<string, string> = {
      requestId: deleteRequest.id,
    };
    if (deleteRequest.reason) {
      deleteRequestedPayload["reason"] = deleteRequest.reason;
    }

    await this.activities.record({
      ownerType: OwnerType.DRIVER,
      ownerId: driver.id,
      type: ACTIVITY_TYPE.DELETE_REQUESTED,
      actorType: OwnerType.USER,
      actorId: context.userId,
      data: deleteRequestedPayload,
    });

    return {
      id: deleteRequest.id,
      status: deleteRequest.status,
      reason: deleteRequest.reason,
      createdAt: deleteRequest.createdAt,
      message: "Delete request submitted. Account deactivated pending admin review.",
    };
  }

  listDeleteRequests(query: DeleteQueryDto) {
    return this.profileRepository.listDeleteRequests(query);
  }

  async getDeleteRequestByDriverId(driverId: string) {
    const driver = await this.driverRepository.findById(driverId);
    if (!driver) {
      throw new NotFoundException("Driver not found");
    }

    const deleteRequest = await this.profileRepository.findLatestDeleteRequest(driverId);
    if (!deleteRequest) {
      return { request: null };
    }

    return { request: deleteRequest };
  }

  async listActivity(driverId: string) {
    const driver = await this.driverRepository.findById(driverId);
    if (!driver) {
      throw new NotFoundException("Driver not found");
    }

    return this.activities.list({
      ownerType: OwnerType.DRIVER,
      ownerId: driverId,
    });
  }

  async approveDeleteRequest(id: string, request: Request) {
    const context = toRequestContext(request);
    const processedBy = requireUserId(context);

    const existing = await this.profileRepository.findDeleteRequestById(id);
    if (!existing) {
      throw new NotFoundException("Delete request not found");
    }
    if (existing.status !== DriverDeleteStatus.PENDING) {
      throw new BadRequestException("Only pending delete requests can be approved");
    }

    const blockingTrips = await this.profileRepository.countBlockingTrips(existing.driverId);
    if (blockingTrips > 0) {
      throw new BadRequestException(
        "Cannot approve delete while driver has active or upcoming trips",
      );
    }

    const approved = await this.profileRepository.approveDeleteRequest(id, processedBy);
    if (!approved) {
      throw new NotFoundException("Delete request not found");
    }

    await this.sessions.revokeAll({ userId: approved.driver.userId });

    await auditLog({
      prisma: this.prisma,
      event: "driver.delete_approved",
      result: "success",
      context,
      userId: context.userId,
      metadata: {
        requestId: approved.id,
        driverId: approved.driverId,
        applicationNumber: approved.driver.applicationNumber,
        softDeleted: true,
        reason: approved.reason,
      },
    });

    const approvedPayload: Record<string, string> = {
      requestId: approved.id,
    };
    if (approved.reason) {
      approvedPayload["reason"] = approved.reason;
    }

    await this.activities.record({
      ownerType: OwnerType.DRIVER,
      ownerId: approved.driverId,
      type: ACTIVITY_TYPE.DELETE_APPROVED,
      actorType: OwnerType.USER,
      actorId: context.userId,
      data: approvedPayload,
    });

    return {
      id: approved.id,
      status: approved.status,
      processedAt: approved.processedAt,
      driver: approved.driver,
      message: "Delete request approved.",
    };
  }

  async rejectDeleteRequest(id: string, body: RejectDeleteDto, request: Request) {
    const context = toRequestContext(request);
    const processedBy = requireUserId(context);

    const existing = await this.profileRepository.findDeleteRequestById(id);
    if (!existing) {
      throw new NotFoundException("Delete request not found");
    }
    if (existing.status !== DriverDeleteStatus.PENDING) {
      throw new BadRequestException("Only pending delete requests can be rejected");
    }

    const rejected = await this.profileRepository.rejectDeleteRequest(
      id,
      processedBy,
      body.adminNote,
    );
    if (!rejected) {
      throw new NotFoundException("Delete request not found");
    }

    await auditLog({
      prisma: this.prisma,
      event: "driver.delete_rejected",
      result: "success",
      context,
      userId: context.userId,
      metadata: {
        requestId: rejected.id,
        driverId: rejected.driverId,
        applicationNumber: rejected.driver.applicationNumber,
        reason: rejected.reason,
        adminNote: rejected.adminNote,
      },
    });

    const rejectedPayload: Record<string, string> = {
      requestId: rejected.id,
    };
    if (rejected.reason) {
      rejectedPayload["reason"] = rejected.reason;
    }
    if (rejected.adminNote) {
      rejectedPayload["adminNote"] = rejected.adminNote;
    }

    await this.activities.record({
      ownerType: OwnerType.DRIVER,
      ownerId: rejected.driverId,
      type: ACTIVITY_TYPE.DELETE_REJECTED,
      actorType: OwnerType.USER,
      actorId: context.userId,
      data: rejectedPayload,
    });

    return {
      id: rejected.id,
      status: rejected.status,
      processedAt: rejected.processedAt,
      adminNote: rejected.adminNote,
      driver: rejected.driver,
      message: "Delete request rejected. Account restored.",
    };
  }
}
