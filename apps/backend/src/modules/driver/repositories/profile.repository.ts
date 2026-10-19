import { Inject, Injectable } from "@nestjs/common";
import {
  DriverDeleteStatus,
  DriverPresenceStatus,
  DriverStatus,
  type Prisma,
} from "@prisma/client";
import { APIFeature } from "../../../common/api-feature";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import type { DeleteQueryDto } from "../dto/profile.dto";
import type { UpdateDriverProfileData } from "../types/profile";
import { DriverRepository } from "./driver.repository";

const deleteRequestInclude = {
  driver: {
    select: {
      id: true,
      applicationNumber: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      avatarUrl: true,
      status: true,
      deletedAt: true,
      userId: true,
    },
  },
} satisfies Prisma.DriverDeleteRequestInclude;

@Injectable()
export class DriverProfileRepository {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(DriverRepository) private readonly drivers: DriverRepository,
  ) {}

  async updateProfile(id: string, data: UpdateDriverProfileData) {
    await this.prisma.$transaction(async (tx) => {
      await tx.driver.update({
        where: { id },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          avatarUrl: data.avatarUrl,
          about: data.about,
          homeAddress: data.homeAddress,
          houseNo: data.houseNo,
          streetName: data.streetName,
          postalCode: data.postalCode,
          city: data.city,
          province: data.province,
          country: data.country,
          countryCode: data.countryCode,
          yearsExperience: data.yearsExperience,
          shift: data.shift,
          startTime: data.startTime,
          endTime: data.endTime,
          dressesInSuit: data.dressesInSuit,
          services: data.services,
        },
      });

      if (data.languages !== undefined) {
        await tx.driverLanguage.deleteMany({ where: { driverId: id } });
        await tx.driverLanguage.createMany({
          data: data.languages.map((item) => ({
            driverId: id,
            code: item.code,
            fluency: item.fluency,
          })),
        });
      }
    });

    return this.drivers.findById(id);
  }

  findPendingDeleteRequest(driverId: string) {
    return this.prisma.driverDeleteRequest.findFirst({
      where: { driverId, status: DriverDeleteStatus.PENDING },
      orderBy: { createdAt: "desc" },
    });
  }

  findLatestDeleteRequest(driverId: string) {
    return this.prisma.driverDeleteRequest.findFirst({
      where: { driverId },
      orderBy: { createdAt: "desc" },
      include: deleteRequestInclude,
    });
  }

  countBlockingTrips(driverId: string) {
    return this.prisma.trip.count({
      where: {
        driverId,
        deletedAt: null,
        status: {
          notIn: ["COMPLETED", "CANCELLED"],
        },
      },
    });
  }

  findDeleteRequestById(id: string) {
    return this.prisma.driverDeleteRequest.findUnique({
      where: { id },
      include: deleteRequestInclude,
    });
  }

  listDeleteRequests(query: DeleteQueryDto) {
    const search =
      (typeof query.q === "string" ? query.q : undefined)?.trim() ||
      (typeof query.search === "string" ? query.search : undefined)?.trim();

    const initialFilter: Prisma.DriverDeleteRequestWhereInput = {};
    if (search) {
      initialFilter.OR = [
        { reason: { contains: search, mode: "insensitive" } },
        { driver: { firstName: { contains: search, mode: "insensitive" } } },
        { driver: { lastName: { contains: search, mode: "insensitive" } } },
        { driver: { email: { contains: search, mode: "insensitive" } } },
        { driver: { applicationNumber: { contains: search, mode: "insensitive" } } },
        { driver: { phone: { contains: search, mode: "insensitive" } } },
      ];
    }

    const feature = new APIFeature(query, {
      initialFilter,
      filterFields: ["status"],
      sort: {
        allowedFields: ["createdAt", "updatedAt", "status", "processedAt"],
        defaultSortBy: "createdAt",
        defaultSortOrder: "desc",
      },
      pagination: {
        defaultLimit: 20,
        maxLimit: 100,
      },
    });

    return feature.execute({
      findMany: (args) =>
        this.prisma.driverDeleteRequest.findMany({
          where: args.where as never,
          orderBy: args.orderBy as never,
          skip: args.skip,
          take: args.take,
          include: deleteRequestInclude,
        }),
      count: ({ where }) => this.prisma.driverDeleteRequest.count({ where: where as never }),
    });
  }

  /** Create pending request and set driver INACTIVE (caller should force offline first). */
  submitDeleteRequest(driverId: string, reason?: string | null) {
    const now = new Date();
    return this.prisma.$transaction(async (tx) => {
      const driver = await tx.driver.findUniqueOrThrow({
        where: { id: driverId },
        select: { id: true, status: true },
      });

      await tx.driver.update({
        where: { id: driverId },
        data: {
          status: DriverStatus.INACTIVE,
          presenceStatus: DriverPresenceStatus.OFFLINE,
          presenceUpdatedAt: now,
          presenceDeviceId: null,
          fcmToken: null,
        },
      });

      return tx.driverDeleteRequest.create({
        data: {
          driverId,
          reason: reason?.trim() ? reason.trim() : null,
          status: DriverDeleteStatus.PENDING,
          previousStatus: driver.status,
        },
        include: deleteRequestInclude,
      });
    });
  }

  /** Soft-delete driver + deactivate user. Permanent purge stays admin-only elsewhere. */
  async approveDeleteRequest(id: string, processedBy: string) {
    return this.prisma.$transaction(async (tx) => {
      const request = await tx.driverDeleteRequest.findUnique({
        where: { id },
        include: { driver: { select: { id: true, userId: true } } },
      });
      if (!request || request.status !== DriverDeleteStatus.PENDING) {
        return null;
      }

      const updated = await tx.driverDeleteRequest.update({
        where: { id },
        data: {
          status: DriverDeleteStatus.APPROVED,
          processedAt: new Date(),
          processedBy,
        },
        include: deleteRequestInclude,
      });

      await tx.driver.update({
        where: { id: request.driverId },
        data: {
          deletedAt: new Date(),
          status: DriverStatus.INACTIVE,
          presenceStatus: DriverPresenceStatus.OFFLINE,
          presenceDeviceId: null,
          fcmToken: null,
        },
      });

      await tx.user.update({
        where: { id: request.driver.userId },
        data: { isActive: false },
      });

      return updated;
    });
  }

  /** Reject pending request and restore previous driver status. */
  async rejectDeleteRequest(id: string, processedBy: string, adminNote?: string | null) {
    return this.prisma.$transaction(async (tx) => {
      const request = await tx.driverDeleteRequest.findUnique({
        where: { id },
      });
      if (!request || request.status !== DriverDeleteStatus.PENDING) {
        return null;
      }

      const rejected = await tx.driverDeleteRequest.update({
        where: { id },
        data: {
          status: DriverDeleteStatus.REJECTED,
          processedAt: new Date(),
          processedBy,
          adminNote: adminNote?.trim() ? adminNote.trim() : null,
        },
        include: deleteRequestInclude,
      });

      await tx.driver.update({
        where: { id: request.driverId },
        data: {
          status: request.previousStatus ?? DriverStatus.ACTIVE,
          deletedAt: null,
        },
      });

      await tx.user.update({
        where: { id: rejected.driver.userId },
        data: { isActive: true },
      });

      return rejected;
    });
  }
}
