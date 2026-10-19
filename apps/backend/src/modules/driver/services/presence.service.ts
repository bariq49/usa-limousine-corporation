import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  DriverApprovalStatus,
  DriverPresenceStatus,
  DriverShiftEndedReason,
  DriverStatus,
  type Driver,
  type DriverShiftSession,
} from "@prisma/client";
import type { Request } from "express";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { auditLog } from "../../../common/utils/audit-log";
import { formatDuration } from "../../../common/utils/format-duration";
import { APP_TIMEZONE } from "../../../common/utils/format-time";
import { toRequestContext } from "../../../common/utils/to-request-context";
import {
  driverRoom,
  driversCategoryRoom,
  driversOnlineRoom,
} from "../../../infrastructure/websocket/constants/rooms";
import { WebsocketService } from "../../../infrastructure/websocket/websocket.service";
import type { BeatDto, HistoryQueryDto, UpdateDto } from "../dto/presence.dto";
import { DriverRepository } from "../repositories/driver.repository";
import { DriverPresenceRepository } from "../repositories/presence.repository";
import type { OfflineParams, OnlineParams, GoOnlineData } from "../types/presence";
import { requireDriver } from "../utils/require-driver";
import { evaluateShiftWindow } from "../utils/shift-window";
import { DriverRealtimeService } from "../websocket/driver-realtime.service";
import { DriverFcmTokenService } from "./fcm-token.service";
import { DriverGeoService } from "./geo.service";

@Injectable()
export class DriverPresenceService {
  constructor(
    @Inject(DriverRepository) private readonly driverRepository: DriverRepository,
    @Inject(DriverPresenceRepository)
    private readonly presenceRepository: DriverPresenceRepository,
    @Inject(DriverRealtimeService) private readonly realtimeService: DriverRealtimeService,
    @Inject(WebsocketService) private readonly websocket: WebsocketService,
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(DriverGeoService) private readonly geo: DriverGeoService,
    @Inject(DriverFcmTokenService) private readonly fcmTokens: DriverFcmTokenService,
  ) {}

  async getPresence(request: Request) {
    const driver = await requireDriver(this.driverRepository, request);

    const session = await this.presenceRepository.findOpenSession(driver.id);
    return {
      presenceStatus: driver.presenceStatus,
      online: driver.presenceStatus === DriverPresenceStatus.ONLINE,
      presenceUpdatedAt: driver.presenceUpdatedAt,
      lastHeartbeatAt: driver.lastHeartbeatAt,
      presenceDeviceId: driver.presenceDeviceId,
      lastLat: driver.lastLat,
      lastLng: driver.lastLng,
      locationUpdatedAt: driver.locationUpdatedAt,
      session,
    };
  }

  listFleetOnline() {
    return this.presenceRepository.listFleetOnline();
  }

  async updatePresence(body: UpdateDto, request: Request) {
    const driver = await requireDriver(this.driverRepository, request);

    const deviceId = body.deviceId.trim();
    if (!deviceId) {
      throw new BadRequestException("deviceId is required");
    }

    if (body.online) {
      if (
        driver.status === DriverStatus.INACTIVE ||
        driver.status === DriverStatus.SUSPENDED ||
        driver.status === DriverStatus.REJECTED
      ) {
        throw new ForbiddenException("Account is not allowed to go online");
      }
      if (typeof body.lat !== "number" || typeof body.lng !== "number") {
        throw new BadRequestException("lat and lng are required to go online");
      }
      const fcmToken = body.fcmToken?.trim();
      const onlineParams: OnlineParams = {
        driver,
        deviceId,
        request,
        lat: body.lat,
        lng: body.lng,
      };
      if (fcmToken) {
        onlineParams.fcmToken = fcmToken;
      }
      return this.goOnline(onlineParams);
    }

    return this.goOffline({
      driver,
      deviceId,
      request,
      endedReason: DriverShiftEndedReason.DRIVER,
    });
  }

  async heartbeatPresence(body: BeatDto, request: Request) {
    const driver = await requireDriver(this.driverRepository, request);

    const deviceId = body.deviceId.trim();
    if (!deviceId) {
      throw new BadRequestException("deviceId is required");
    }

    if (driver.presenceStatus !== DriverPresenceStatus.ONLINE) {
      throw new ForbiddenException("Driver must be online to send heartbeat");
    }

    if (!driver.presenceDeviceId || driver.presenceDeviceId !== deviceId) {
      throw new ForbiddenException("Heartbeat rejected for this device");
    }

    if (typeof body.lat !== "number" || typeof body.lng !== "number") {
      throw new BadRequestException("lat and lng are required on heartbeat");
    }

    const now = new Date();
    const location = { lat: body.lat, lng: body.lng };
    await this.presenceRepository.updateHeartbeat(driver.id, now, location);
    const updated = await this.driverRepository.findById(driver.id);
    if (!updated) {
      throw new NotFoundException("Driver profile not found");
    }
    const session = await this.presenceRepository.findOpenSession(driver.id);
    const categoryId = updated.vehicle?.vehicleCategoryId ?? null;
    await this.geo.upsert({
      driverId: driver.id,
      lat: location.lat,
      lng: location.lng,
      categoryId,
    });

    await this.joinOnlineRooms(updated.id, categoryId);
    this.emitUpdated(updated, session, categoryId);

    return {
      presenceStatus: updated.presenceStatus,
      online: updated.presenceStatus === DriverPresenceStatus.ONLINE,
      presenceUpdatedAt: updated.presenceUpdatedAt,
      lastHeartbeatAt: updated.lastHeartbeatAt,
      presenceDeviceId: updated.presenceDeviceId,
      lastLat: updated.lastLat,
      lastLng: updated.lastLng,
      locationUpdatedAt: updated.locationUpdatedAt,
      session,
    };
  }

  async listPresenceHistory(query: HistoryQueryDto, request: Request) {
    const driver = await requireDriver(this.driverRepository, request);

    const result = await this.presenceRepository.history(driver.id, query);
    return {
      data: result.data.map((session) => ({
        id: session.id,
        driverId: session.driverId,
        status: session.status,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
        duration: formatDuration(session.durationSeconds),
        extra: formatDuration(session.extraSeconds),
        shiftType: session.shiftType,
        scheduledStartTime: session.scheduledStartTime,
        scheduledEndTime: session.scheduledEndTime,
        timezone: session.timezone,
        endedReason: session.endedReason,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      })),
      total: result.total,
      page: result.page,
      limit: result.limit,
      pages: result.pages,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage,
    };
  }

  async removePresenceHistory(sessionId: string, request: Request) {
    const context = toRequestContext(request);
    const driver = await requireDriver(this.driverRepository, request);

    const session = await this.presenceRepository.findClosed(driver.id, sessionId);
    if (!session) {
      throw new NotFoundException("Presence history not found");
    }

    await this.presenceRepository.remove(driver.id, sessionId);
    await auditLog({
      prisma: this.prisma,
      event: "driver.presence.history_deleted",
      context,
      userId: context.userId,
      result: "success",
      metadata: { driverId: driver.id, sessionId },
    });

    return { deleted: true, id: sessionId };
  }

  async clearPresenceHistory(request: Request) {
    const context = toRequestContext(request);
    const driver = await requireDriver(this.driverRepository, request);
    const result = await this.presenceRepository.clear(driver.id);
    await auditLog({
      prisma: this.prisma,
      event: "driver.presence.history_cleared",
      context,
      userId: context.userId,
      result: "success",
      metadata: { driverId: driver.id, deletedCount: result.count },
    });

    return { deleted: true, count: result.count };
  }

  async goOnline(params: OnlineParams) {
    const { driver, deviceId, request, fcmToken, lat, lng } = params;
    const context = toRequestContext(request);
    const now = new Date();

    if (typeof lat !== "number" || typeof lng !== "number") {
      throw new BadRequestException("lat and lng are required to go online");
    }

    if (
      driver.status !== DriverStatus.ACTIVE ||
      driver.approvalStatus !== DriverApprovalStatus.APPROVED
    ) {
      throw new ForbiddenException("Driver must be active and approved to go online");
    }

    const settings = await this.prisma.driverSettings.findUnique({
      where: { driverId: driver.id },
      select: { timezone: true },
    });
    const timezone = settings?.timezone || APP_TIMEZONE;
    const window = evaluateShiftWindow({
      shift: driver.shift,
      startTime: driver.startTime,
      endTime: driver.endTime,
      timezone,
      now,
    });

    if (!window.canStart) {
      const schedule = `${driver.startTime ?? "??"}-${driver.endTime ?? "??"}`;
      throw new BadRequestException(
        `Shift has not started yet or is outside the allowed window (timezone=${timezone}, local=${window.localTime}, schedule=${schedule})`,
      );
    }

    if (
      driver.presenceStatus === DriverPresenceStatus.ONLINE &&
      driver.presenceDeviceId === deviceId
    ) {
      if (fcmToken) {
        await this.fcmTokens.registerDevice(driver.id, { token: fcmToken, deviceId });
      }
      await this.prisma.driver.update({
        where: { id: driver.id },
        data: {
          lastLat: lat,
          lastLng: lng,
          locationUpdatedAt: now,
          lastHeartbeatAt: now,
        },
      });
      const refreshed = await this.driverRepository.findById(driver.id);
      const session = await this.presenceRepository.findOpenSession(driver.id);
      const categoryId = refreshed?.vehicle?.vehicleCategoryId ?? null;
      await this.joinOnlineRooms(driver.id, categoryId);
      await this.geo.upsert({ driverId: driver.id, lat, lng, categoryId });
      if (refreshed) {
        this.emitUpdated(refreshed, session, categoryId);
      }
      return {
        presenceStatus: DriverPresenceStatus.ONLINE,
        online: true,
        presenceUpdatedAt: refreshed?.presenceUpdatedAt ?? driver.presenceUpdatedAt,
        lastHeartbeatAt: refreshed?.lastHeartbeatAt ?? driver.lastHeartbeatAt,
        presenceDeviceId: deviceId,
        lastLat: refreshed?.lastLat ?? driver.lastLat,
        lastLng: refreshed?.lastLng ?? driver.lastLng,
        locationUpdatedAt: refreshed?.locationUpdatedAt ?? driver.locationUpdatedAt,
        session,
      };
    }

    const goOnlineData: GoOnlineData = {
      driverId: driver.id,
      deviceId,
      shiftType: driver.shift,
      scheduledStartTime: driver.startTime,
      scheduledEndTime: driver.endTime,
      timezone,
      now,
      lat,
      lng,
    };
    if (fcmToken) {
      goOnlineData.fcmToken = fcmToken;
      await this.fcmTokens.registerDevice(driver.id, { token: fcmToken, deviceId });
    }

    const result = await this.presenceRepository.goOnline(goOnlineData);
    const categoryId = await this.vehicleCategoryId(driver.id);

    await auditLog({
      prisma: this.prisma,
      event: "driver.presence.online",
      context,
      userId: context.userId,
      result: "success",
      metadata: { driverId: driver.id, deviceId, timezone },
    });

    await this.joinOnlineRooms(driver.id, categoryId);
    await this.geo.upsert({ driverId: driver.id, lat, lng, categoryId });
    this.emitUpdated(result.driver, result.session, categoryId);
    return {
      presenceStatus: result.driver.presenceStatus,
      online: result.driver.presenceStatus === DriverPresenceStatus.ONLINE,
      presenceUpdatedAt: result.driver.presenceUpdatedAt,
      lastHeartbeatAt: result.driver.lastHeartbeatAt,
      presenceDeviceId: result.driver.presenceDeviceId,
      lastLat: result.driver.lastLat,
      lastLng: result.driver.lastLng,
      locationUpdatedAt: result.driver.locationUpdatedAt,
      session: result.session,
    };
  }

  async goOffline(params: OfflineParams) {
    const { driver, deviceId, request, endedReason } = params;
    const context = toRequestContext(request);
    const now = new Date();

    if (driver.presenceStatus === DriverPresenceStatus.OFFLINE) {
      return {
        presenceStatus: driver.presenceStatus,
        online: false,
        presenceUpdatedAt: driver.presenceUpdatedAt,
        lastHeartbeatAt: driver.lastHeartbeatAt,
        presenceDeviceId: driver.presenceDeviceId,
        lastLat: driver.lastLat,
        lastLng: driver.lastLng,
        locationUpdatedAt: driver.locationUpdatedAt,
        session: null,
      };
    }

    if (driver.presenceDeviceId && driver.presenceDeviceId !== deviceId) {
      throw new ForbiddenException("Presence device mismatch");
    }

    const categoryId = await this.vehicleCategoryId(driver.id);
    const result = await this.presenceRepository.goOffline({
      driverId: driver.id,
      endedReason,
      now,
    });

    await auditLog({
      prisma: this.prisma,
      event: "driver.presence.offline",
      context,
      userId: context.userId,
      result: "success",
      metadata: { driverId: driver.id, endedReason },
    });

    await this.leaveOnlineRooms(driver.id, categoryId);
    await this.geo.remove({ driverId: driver.id, categoryId });
    this.emitUpdated(result.driver, result.session, categoryId);
    return {
      presenceStatus: result.driver.presenceStatus,
      online: result.driver.presenceStatus === DriverPresenceStatus.ONLINE,
      presenceUpdatedAt: result.driver.presenceUpdatedAt,
      lastHeartbeatAt: result.driver.lastHeartbeatAt,
      presenceDeviceId: result.driver.presenceDeviceId,
      lastLat: result.driver.lastLat,
      lastLng: result.driver.lastLng,
      locationUpdatedAt: result.driver.locationUpdatedAt,
      session: result.session,
    };
  }

  async joinOnlineRooms(driverId: string, vehicleCategoryId: string | null) {
    const from = driverRoom(driverId);
    await this.websocket.setRoomMembership({
      from,
      room: driversOnlineRoom(),
      join: true,
    });
    if (vehicleCategoryId) {
      await this.websocket.setRoomMembership({
        from,
        room: driversCategoryRoom(vehicleCategoryId),
        join: true,
      });
    }
  }

  async leaveOnlineRooms(driverId: string, vehicleCategoryId: string | null) {
    const from = driverRoom(driverId);
    await this.websocket.setRoomMembership({
      from,
      room: driversOnlineRoom(),
      join: false,
    });
    if (vehicleCategoryId) {
      await this.websocket.setRoomMembership({
        from,
        room: driversCategoryRoom(vehicleCategoryId),
        join: false,
      });
    }
  }

  async vehicleCategoryId(driverId: string) {
    const vehicle = await this.prisma.driverVehicle.findFirst({
      where: { driverId, deletedAt: null },
      select: { vehicleCategoryId: true },
    });
    return vehicle?.vehicleCategoryId ?? null;
  }

  emitUpdated(
    driver: Driver & { vehicle?: { vehicleCategoryId: string } | null },
    session: DriverShiftSession | null,
    vehicleCategoryId?: string | null,
  ) {
    this.realtimeService.emitUpdated({
      driverId: driver.id,
      online: driver.presenceStatus === DriverPresenceStatus.ONLINE,
      presenceStatus: driver.presenceStatus,
      presenceDeviceId: driver.presenceDeviceId,
      sessionId: session?.id ?? null,
      startedAt: session?.startedAt ?? null,
      endedAt: session?.endedAt ?? null,
      duration: session ? formatDuration(session.durationSeconds) : null,
      extra: session ? formatDuration(session.extraSeconds) : null,
      endedReason: session?.endedReason ?? null,
      lastLat: driver.lastLat ?? null,
      lastLng: driver.lastLng ?? null,
      locationUpdatedAt: driver.locationUpdatedAt ?? null,
      vehicleCategoryId: vehicleCategoryId ?? driver.vehicle?.vehicleCategoryId ?? null,
    });
  }
}
