import { Inject, Injectable } from "@nestjs/common";
import {
  DriverPresenceStatus,
  DriverShiftSessionStatus,
  type DriverShiftSession,
} from "@prisma/client";
import { APIFeature } from "../../../common/api-feature";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import type { HistoryQueryDto } from "../dto/presence.dto";
import type {
  GoOfflineData,
  GoOnlineData,
  GoOnlineUpdate,
  LocationUpdate,
  OfflineResult,
  ShiftResult,
} from "../types/presence";
import { calculateExtraSeconds } from "../utils/shift-window";

@Injectable()
export class DriverPresenceRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  findOpenSession(driverId: string) {
    return this.prisma.driverShiftSession.findFirst({
      where: { driverId, status: DriverShiftSessionStatus.OPEN },
      orderBy: { startedAt: "desc" },
    });
  }

  history(driverId: string, query: HistoryQueryDto) {
    const feature = new APIFeature(query, {
      initialFilter: {
        driverId,
        status: DriverShiftSessionStatus.CLOSED,
      },
      filterFields: ["endedReason"],
      dateRange: {
        field: "startedAt",
      },
      sort: {
        allowedFields: ["startedAt", "endedAt", "durationSeconds", "extraSeconds", "createdAt"],
        defaultSortBy: "startedAt",
        defaultSortOrder: "desc",
      },
      pagination: {
        defaultLimit: 20,
        maxLimit: 100,
      },
    });

    return feature.execute({
      findMany: (args) =>
        this.prisma.driverShiftSession.findMany({
          where: args.where as never,
          orderBy: args.orderBy as never,
          skip: args.skip,
          take: args.take,
        }),
      count: ({ where }) => this.prisma.driverShiftSession.count({ where: where as never }),
    });
  }

  findClosed(driverId: string, sessionId: string) {
    return this.prisma.driverShiftSession.findFirst({
      where: {
        id: sessionId,
        driverId,
        status: DriverShiftSessionStatus.CLOSED,
      },
    });
  }

  remove(driverId: string, sessionId: string) {
    return this.prisma.driverShiftSession.deleteMany({
      where: {
        id: sessionId,
        driverId,
        status: DriverShiftSessionStatus.CLOSED,
      },
    });
  }

  clear(driverId: string) {
    return this.prisma.driverShiftSession.deleteMany({
      where: {
        driverId,
        status: DriverShiftSessionStatus.CLOSED,
      },
    });
  }

  listOnlineDrivers() {
    return this.prisma.driver.findMany({
      where: {
        deletedAt: null,
        presenceStatus: DriverPresenceStatus.ONLINE,
        fcmToken: { not: null },
        OR: [{ settings: null }, { settings: { push: true } }],
      },
      select: {
        id: true,
        fcmToken: true,
      },
    });
  }

  listOnlineForBooking(vehicleCategoryId: string) {
    return this.prisma.driver.findMany({
      where: {
        deletedAt: null,
        presenceStatus: DriverPresenceStatus.ONLINE,
        vehicle: {
          deletedAt: null,
          vehicleCategoryId,
        },
      },
      select: {
        id: true,
        fcmToken: true,
      },
    });
  }

  listFleetOnline() {
    return this.prisma.driver.findMany({
      where: {
        deletedAt: null,
        presenceStatus: DriverPresenceStatus.ONLINE,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        lastLat: true,
        lastLng: true,
        locationUpdatedAt: true,
        presenceStatus: true,
        lastHeartbeatAt: true,
        vehicle: {
          select: {
            vehicleCategoryId: true,
            make: true,
            model: true,
            licensePlate: true,
          },
        },
      },
    });
  }

  async goOnline(params: GoOnlineData): Promise<ShiftResult> {
    const { driverId, deviceId, shiftType, scheduledStartTime, scheduledEndTime, timezone, now } =
      params;

    return this.prisma.$transaction(async (tx) => {
      const open = await tx.driverShiftSession.findFirst({
        where: { driverId, status: DriverShiftSessionStatus.OPEN },
      });

      let session: DriverShiftSession;
      if (open) {
        session = open;
      } else {
        session = await tx.driverShiftSession.create({
          data: {
            driverId,
            status: DriverShiftSessionStatus.OPEN,
            startedAt: now,
            shiftType,
            scheduledStartTime,
            scheduledEndTime,
            timezone,
          },
        });
      }

      const data: GoOnlineUpdate = {
        presenceStatus: DriverPresenceStatus.ONLINE,
        presenceUpdatedAt: now,
        lastHeartbeatAt: now,
        presenceDeviceId: deviceId,
        lastLat: params.lat,
        lastLng: params.lng,
        locationUpdatedAt: now,
      };
      if (params.fcmToken) {
        data.fcmToken = params.fcmToken;
      }

      const driver = await tx.driver.update({
        where: { id: driverId },
        data,
      });

      return { driver, session };
    });
  }

  async goOffline(params: GoOfflineData): Promise<OfflineResult> {
    const { driverId, endedReason, now } = params;

    return this.prisma.$transaction(async (tx) => {
      const open = await tx.driverShiftSession.findFirst({
        where: { driverId, status: DriverShiftSessionStatus.OPEN },
        orderBy: { startedAt: "desc" },
      });

      let session: DriverShiftSession | null = null;
      if (open) {
        const durationSeconds = Math.max(
          0,
          Math.floor((now.getTime() - open.startedAt.getTime()) / 1000),
        );
        const extraSeconds = calculateExtraSeconds({
          shiftType: open.shiftType,
          scheduledStartTime: open.scheduledStartTime,
          scheduledEndTime: open.scheduledEndTime,
          timezone: open.timezone,
          startedAt: open.startedAt,
          endedAt: now,
        });
        session = await tx.driverShiftSession.update({
          where: { id: open.id },
          data: {
            status: DriverShiftSessionStatus.CLOSED,
            endedAt: now,
            durationSeconds,
            extraSeconds,
            endedReason,
          },
        });
      }

      const driver = await tx.driver.update({
        where: { id: driverId },
        data: {
          presenceStatus: DriverPresenceStatus.OFFLINE,
          presenceUpdatedAt: now,
          presenceDeviceId: null,
        },
      });

      return { driver, session };
    });
  }

  updateHeartbeat(driverId: string, now: Date, location?: { lat: number; lng: number }) {
    const data: LocationUpdate = { lastHeartbeatAt: now };
    if (location) {
      data.lastLat = location.lat;
      data.lastLng = location.lng;
      data.locationUpdatedAt = now;
    }
    return this.prisma.driver.update({
      where: { id: driverId },
      data,
    });
  }

  updateDevice(driverId: string, deviceId: string, now: Date) {
    return this.prisma.driver.update({
      where: { id: driverId },
      data: {
        presenceDeviceId: deviceId,
        lastHeartbeatAt: now,
        presenceUpdatedAt: now,
      },
    });
  }
}
